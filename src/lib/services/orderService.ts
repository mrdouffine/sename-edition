import mongoose from "mongoose";
import { randomBytes } from "node:crypto";
import { ApiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import BookModel from "@/models/Book";
import OrderModel, { type OrderItem } from "@/models/Order";
import UserModel from "@/models/User";
import { generateInvoicePdf } from "@/lib/services/invoiceService";

function buildInvoiceNumber() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `INV-${y}${m}${day}-${suffix}`;
}

function isTransactionUnsupportedError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return /Transaction numbers are only allowed on a replica set member or mongos/i.test(error.message);
}

async function runWithOptionalTransaction<T>(
  operation: (session: mongoose.ClientSession | null) => Promise<T>
) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    try {
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      if (isTransactionUnsupportedError(error)) {
        return operation(null);
      }
      throw error;
    }
  } finally {
    session.endSession();
  }
}

export async function createOrder(params: {
  userId: string;
  items: Array<{ bookId: string; quantity: number }>;
  saleType: "direct" | "preorder";
  paymentMethod: "stripe" | "paypal" | "mobile_money";
  promoCode?: string;
}) {
  await connectToDatabase();
  return runWithOptionalTransaction(async (session) => {
    const userQuery = UserModel.findById(params.userId, { name: 1, email: 1 });
    if (session) userQuery.session(session);
    const user = await userQuery;
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const items: OrderItem[] = [];
    let total = 0;

    for (const item of params.items) {
      const bookQuery = BookModel.findById(item.bookId);
      if (session) bookQuery.session(session);
      const book = await bookQuery;
      if (!book) {
        throw new ApiError("Book not found", 404);
      }
      if (book.saleType !== params.saleType) {
        throw new ApiError("Book sale type mismatch", 400);
      }

      if (params.saleType === "direct" || params.saleType === "preorder") {
        if (book.stock === undefined || book.stock < item.quantity) {
          throw new ApiError("Insufficient stock", 409);
        }
      }

      items.push({
        book: book._id,
        quantity: item.quantity,
        unitPrice: book.price
      });

      total += book.price * item.quantity;
    }

    const invoiceNumber = buildInvoiceNumber();
    const order = new OrderModel({
      user: params.userId,
      items,
      total,
      status: "pending",
      saleType: params.saleType,
      paymentMethod: params.paymentMethod,
      promoCode: params.promoCode,
      invoiceNumber,
      createdAt: new Date()
    });
    await order.save(session ? { session } : undefined);

    return order;
  });
}

export async function markOrderAsPaid(params: {
  orderId: string;
  paymentMethod: "stripe" | "paypal" | "mobile_money";
  transactionId?: string;
  paymentReference?: string;
}) {
  await connectToDatabase();
  return runWithOptionalTransaction(async (session) => {
    const orderQuery = OrderModel.findById(params.orderId);
    if (session) orderQuery.session(session);
    const order = await orderQuery;
    if (!order) {
      throw new ApiError("Order not found", 404);
    }
    if (order.status === "paid") {
      return order;
    }
    if (order.status !== "pending") {
      throw new ApiError("Order cannot be paid in its current state", 409);
    }

    const userQuery = UserModel.findById(order.user, { name: 1, email: 1 });
    if (session) userQuery.session(session);
    const user = await userQuery;
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const invoiceItems: Array<OrderItem & { title?: string }> = [];
    for (const item of order.items) {
      const bookQuery = BookModel.findById(item.book);
      if (session) bookQuery.session(session);
      const book = await bookQuery;
      if (!book) {
        throw new ApiError("Book not found", 404);
      }

      if (book.saleType !== order.saleType) {
        throw new ApiError("Book sale type mismatch", 400);
      }

      if (book.stock === undefined || book.stock < item.quantity) {
        throw new ApiError("Insufficient stock", 409);
      }

      book.stock -= item.quantity;
      await book.save(session ? { session } : undefined);

      invoiceItems.push({
        book: book._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        title: book.title
      });
    }

    const effectiveTransactionId = params.transactionId ?? `txn_${Date.now()}_${randomBytes(4).toString("hex")}`;
    const createdAt = new Date();
    const invoicePdf = generateInvoicePdf({
      invoiceNumber: order.invoiceNumber,
      orderId: effectiveTransactionId,
      customerName: user.name,
      customerEmail: user.email,
      saleType: order.saleType,
      paymentMethod: params.paymentMethod,
      paymentReference: params.paymentReference,
      total: order.total,
      createdAt,
      items: invoiceItems
    });

    order.status = "paid";
    order.paymentMethod = params.paymentMethod;
    order.transactionId = effectiveTransactionId;
    order.paymentReference = params.paymentReference;
    order.paidAt = createdAt;
    order.invoicePdfBase64 = invoicePdf.toString("base64");
    await order.save(session ? { session } : undefined);

    await UserModel.findByIdAndUpdate(
      order.user,
      { $inc: { rewardPoints: Math.max(1, Math.floor(order.total)) } },
      session ? { session } : {}
    );

    return order;
  });
}

export async function cancelOrder(params: { orderId: string; userId: string }) {
  await connectToDatabase();

  const order = await OrderModel.findById(params.orderId);
  if (!order) {
    throw new ApiError("Order not found", 404);
  }
  if (order.user.toString() !== params.userId) {
    throw new ApiError("Forbidden", 403);
  }
  if (order.status === "paid") {
    throw new ApiError("Paid order cannot be cancelled", 409);
  }
  if (order.status === "cancelled") {
    return order;
  }
  if (order.status !== "pending") {
    throw new ApiError("Order cannot be cancelled in its current state", 409);
  }

  order.status = "cancelled";
  await order.save();
  return order;
}

export async function markOrderAsRefunded(params: {
  orderId: string;
  paymentReference?: string;
}) {
  await connectToDatabase();
  return runWithOptionalTransaction(async (session) => {
    const orderQuery = OrderModel.findById(params.orderId);
    if (session) orderQuery.session(session);
    const order = await orderQuery;
    if (!order) {
      throw new ApiError("Order not found", 404);
    }
    if (order.status === "refunded") {
      return order;
    }
    if (order.status !== "paid") {
      throw new ApiError("Only paid orders can be refunded", 409);
    }

    for (const item of order.items) {
      const bookQuery = BookModel.findById(item.book);
      if (session) bookQuery.session(session);
      const book = await bookQuery;
      if (!book) continue;
      book.stock = (book.stock ?? 0) + item.quantity;
      await book.save(session ? { session } : undefined);
    }

    await UserModel.findByIdAndUpdate(
      order.user,
      { $inc: { rewardPoints: -Math.max(1, Math.floor(order.total)) } },
      session ? { session } : {}
    );

    order.status = "refunded";
    if (params.paymentReference) {
      order.paymentReference = params.paymentReference;
    }
    await order.save(session ? { session } : undefined);
    return order;
  });
}
