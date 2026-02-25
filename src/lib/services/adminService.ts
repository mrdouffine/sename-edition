import { ApiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import BookModel from "@/models/Book";
import CommentModel from "@/models/Comment";
import ContributionModel from "@/models/Contribution";
import OrderModel from "@/models/Order";
import PaymentTransactionModel from "@/models/PaymentTransaction";
import PromoCodeModel from "@/models/PromoCode";
import UserModel from "@/models/User";
import { markOrderAsPaid, markOrderAsRefunded } from "@/lib/services/orderService";
import { recordPaymentTransaction } from "@/lib/services/paymentAuditService";
import { refundPaypalCapture, refundStripePayment } from "@/lib/services/paymentService";

export async function listAdminUsers() {
  await connectToDatabase();

  const users = await UserModel.find({}, { name: 1, email: 1, role: 1 }).sort({ _id: -1 }).lean();

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  }));
}

export async function listAdminPaymentTransactions() {
  await connectToDatabase();

  const transactions = await PaymentTransactionModel.find(
    {},
    {
      orderId: 1,
      userId: 1,
      provider: 1,
      kind: 1,
      providerEventId: 1,
      providerReference: 1,
      status: 1,
      amount: 1,
      currency: 1,
      createdAt: 1
    }
  )
    .sort({ _id: -1 })
    .limit(500)
    .lean();

  return transactions.map((tx) => ({
    id: tx._id.toString(),
    orderId: tx.orderId ? tx.orderId.toString() : null,
    userId: tx.userId ? tx.userId.toString() : null,
    provider: tx.provider,
    kind: tx.kind,
    providerEventId: tx.providerEventId ?? null,
    providerReference: tx.providerReference ?? null,
    status: tx.status,
    amount: tx.amount ?? null,
    currency: tx.currency ?? null,
    createdAt: (tx as { createdAt?: Date }).createdAt ?? null
  }));
}

export async function updateUserRole(params: { userId: string; role: "client" | "admin" }) {
  await connectToDatabase();

  const user = await UserModel.findByIdAndUpdate(
    params.userId,
    { role: params.role },
    { new: true, projection: { name: 1, email: 1, role: 1 } }
  ).lean();

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function listAdminOrders() {
  await connectToDatabase();

  const orders = await OrderModel.find(
    {},
    { user: 1, total: 1, status: 1, saleType: 1, paymentMethod: 1, invoiceNumber: 1 }
  )
    .sort({ _id: -1 })
    .limit(200)
    .lean();

  return orders.map((order) => ({
    id: order._id.toString(),
    userId: order.user.toString(),
    total: order.total,
    status: order.status,
    saleType: order.saleType,
    paymentMethod: order.paymentMethod,
    invoiceNumber: order.invoiceNumber
  }));
}

export async function updateOrderStatus(params: {
  orderId: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
}) {
  await connectToDatabase();

  if (params.status === "paid") {
    const finalized = await markOrderAsPaid({
      orderId: params.orderId,
      paymentMethod: "mobile_money",
      transactionId: `admin_${Date.now()}`
    });

    return {
      id: finalized._id.toString(),
      userId: finalized.user.toString(),
      total: finalized.total,
      status: finalized.status,
      saleType: finalized.saleType,
      paymentMethod: finalized.paymentMethod,
      invoiceNumber: finalized.invoiceNumber
    };
  }

  if (params.status === "refunded") {
    const current = await OrderModel.findById(params.orderId, {
      user: 1,
      total: 1,
      status: 1,
      saleType: 1,
      paymentMethod: 1,
      invoiceNumber: 1,
      transactionId: 1,
      paymentReference: 1
    });
    if (!current) {
      throw new ApiError("Order not found", 404);
    }
    if (current.status === "refunded") {
      return {
        id: current._id.toString(),
        userId: current.user.toString(),
        total: current.total,
        status: current.status,
        saleType: current.saleType,
        paymentMethod: current.paymentMethod,
        invoiceNumber: current.invoiceNumber
      };
    }
    if (current.status !== "paid") {
      throw new ApiError("Only paid orders can be refunded", 409);
    }

    if (current.paymentMethod === "stripe") {
      if (!current.transactionId) {
        throw new ApiError("Missing Stripe payment intent", 409);
      }
      const refund = await refundStripePayment({ paymentIntentId: current.transactionId });
      const refundId = typeof refund.id === "string" ? refund.id : undefined;
      await markOrderAsRefunded({ orderId: current._id.toString(), paymentReference: refundId });
      await recordPaymentTransaction({
        orderId: current._id.toString(),
        userId: current.user.toString(),
        provider: "stripe",
        kind: "refund",
        providerReference: refundId ?? current.transactionId,
        status: "succeeded",
        amount: current.total,
        currency: "EUR"
      });
    } else if (current.paymentMethod === "paypal") {
      if (!current.transactionId) {
        throw new ApiError("Missing PayPal capture ID", 409);
      }
      const refund = await refundPaypalCapture({ captureId: current.transactionId });
      const refundId = typeof refund.id === "string" ? refund.id : undefined;
      await markOrderAsRefunded({ orderId: current._id.toString(), paymentReference: refundId });
      await recordPaymentTransaction({
        orderId: current._id.toString(),
        userId: current.user.toString(),
        provider: "paypal",
        kind: "refund",
        providerReference: refundId ?? current.transactionId,
        status: "succeeded",
        amount: current.total,
        currency: "EUR"
      });
    } else {
      throw new ApiError("Refund is not supported for this payment method", 409);
    }

    const refunded = await OrderModel.findById(params.orderId, {
      user: 1,
      total: 1,
      status: 1,
      saleType: 1,
      paymentMethod: 1,
      invoiceNumber: 1
    });
    if (!refunded) {
      throw new ApiError("Order not found", 404);
    }

    return {
      id: refunded._id.toString(),
      userId: refunded.user.toString(),
      total: refunded.total,
      status: refunded.status,
      saleType: refunded.saleType,
      paymentMethod: refunded.paymentMethod,
      invoiceNumber: refunded.invoiceNumber
    };
  }

  const current = await OrderModel.findById(params.orderId, {
    user: 1,
    total: 1,
    status: 1,
    saleType: 1,
    paymentMethod: 1,
    invoiceNumber: 1
  });
  if (!current) {
    throw new ApiError("Order not found", 404);
  }

  if (current.status !== params.status) {
    const points = Math.max(1, Math.floor(current.total));
    if (current.status === "paid") {
      await UserModel.findByIdAndUpdate(current.user, { $inc: { rewardPoints: -points } });
    }
  }

  current.status = params.status;
  await current.save();

  const order = current.toObject() as {
    _id: { toString(): string };
    user: { toString(): string };
    total: number;
    status: "pending" | "paid" | "cancelled" | "refunded";
    saleType: "direct" | "preorder";
    paymentMethod: "stripe" | "paypal" | "mobile_money";
    invoiceNumber: string;
  };

  return {
    id: order._id.toString(),
    userId: order.user.toString(),
    total: order.total,
    status: order.status,
    saleType: order.saleType,
    paymentMethod: order.paymentMethod,
    invoiceNumber: order.invoiceNumber
  };
}

export async function listAdminComments() {
  await connectToDatabase();

  const comments = await CommentModel.find(
    {},
    {
      user: 1,
      book: 1,
      rating: 1,
      content: 1,
      status: 1,
      authorReply: 1,
      reportCount: 1,
      reviewerName: 1,
      reviewerEmail: 1
    }
  )
    .sort({ _id: -1 })
    .limit(200)
    .populate({ path: "user", select: "name email" })
    .populate({ path: "book", select: "title slug" })
    .lean();

  return comments.map((comment) => ({
    // On garde un fallback si l'utilisateur/le livre a été supprimé.
    userRef: comment.user as unknown,
    bookRef: comment.book as unknown,
    id: comment._id.toString(),
    userId:
      typeof (comment.user as { _id?: { toString(): string } })?._id?.toString === "function"
        ? (comment.user as { _id: { toString(): string } })._id.toString()
        : "",
    userName: (comment.user as { name?: string } | null)?.name ?? "Lecteur",
    userEmail: (comment.user as { email?: string } | null)?.email ?? "",
    bookId:
      typeof (comment.book as { _id?: { toString(): string } })?._id?.toString === "function"
        ? (comment.book as { _id: { toString(): string } })._id.toString()
        : "",
    bookTitle: (comment.book as { title?: string } | null)?.title ?? "Ouvrage",
    bookSlug: (comment.book as { slug?: string } | null)?.slug ?? "",
    reviewerName: comment.reviewerName,
    reviewerEmail: comment.reviewerEmail,
    rating: comment.rating,
    content: comment.content,
    status: comment.status,
    authorReply: comment.authorReply,
    reportCount: comment.reportCount ?? 0
  })).map(({ userRef: _u, bookRef: _b, ...rest }) => rest);
}

export async function updateCommentStatus(params: {
  commentId: string;
  status: "pending" | "approved" | "rejected";
}) {
  await connectToDatabase();

  const comment = await CommentModel.findByIdAndUpdate(
    params.commentId,
    { status: params.status },
    {
      new: true,
      projection: {
        user: 1,
        book: 1,
        rating: 1,
        content: 1,
        status: 1,
        authorReply: 1,
        reportCount: 1,
        reviewerName: 1,
        reviewerEmail: 1
      }
    }
  )
    .populate({ path: "user", select: "name email" })
    .populate({ path: "book", select: "title slug" })
    .lean();

  if (!comment) {
    throw new ApiError("Comment not found", 404);
  }

  return {
    id: comment._id.toString(),
    userId:
      typeof (comment.user as { _id?: { toString(): string } })?._id?.toString === "function"
        ? (comment.user as { _id: { toString(): string } })._id.toString()
        : "",
    userName: (comment.user as { name?: string } | null)?.name ?? "Lecteur",
    userEmail: (comment.user as { email?: string } | null)?.email ?? "",
    bookId:
      typeof (comment.book as { _id?: { toString(): string } })?._id?.toString === "function"
        ? (comment.book as { _id: { toString(): string } })._id.toString()
        : "",
    bookTitle: (comment.book as { title?: string } | null)?.title ?? "Ouvrage",
    bookSlug: (comment.book as { slug?: string } | null)?.slug ?? "",
    reviewerName: comment.reviewerName,
    reviewerEmail: comment.reviewerEmail,
    rating: comment.rating,
    content: comment.content,
    status: comment.status,
    authorReply: comment.authorReply,
    reportCount: comment.reportCount ?? 0
  };
}

export async function listAdminContributions() {
  await connectToDatabase();

  const contributions = await ContributionModel.find(
    {},
    { user: 1, book: 1, amount: 1, reward: 1, contributorName: 1, isPublic: 1, status: 1 }
  )
    .sort({ _id: -1 })
    .limit(200)
    .lean();

  return contributions.map((contribution) => ({
    id: contribution._id.toString(),
    userId: contribution.user ? contribution.user.toString() : null,
    bookId: contribution.book.toString(),
    amount: contribution.amount,
    reward: contribution.reward,
    contributorName: contribution.contributorName,
    isPublic: contribution.isPublic,
    status: contribution.status
  }));
}

export async function updateContributionStatus(params: {
  contributionId: string;
  status: "pending" | "paid" | "refunded";
}) {
  await connectToDatabase();

  const contribution = await ContributionModel.findById(params.contributionId, {
    user: 1,
    book: 1,
    amount: 1,
    reward: 1,
    contributorName: 1,
    isPublic: 1,
    status: 1
  });
  if (!contribution) {
    throw new ApiError("Contribution not found", 404);
  }

  if (contribution.status !== params.status) {
    if (contribution.status !== "paid" && params.status === "paid") {
      await BookModel.findByIdAndUpdate(contribution.book, {
        $inc: { fundingRaised: contribution.amount }
      });
      if (contribution.user) {
        await UserModel.findByIdAndUpdate(contribution.user, {
          $inc: { rewardPoints: Math.max(1, Math.floor(contribution.amount)) }
        });
      }
    }

    if (contribution.status === "paid" && params.status !== "paid") {
      await BookModel.findByIdAndUpdate(contribution.book, {
        $inc: { fundingRaised: -contribution.amount }
      });
      if (contribution.user) {
        await UserModel.findByIdAndUpdate(contribution.user, {
          $inc: { rewardPoints: -Math.max(1, Math.floor(contribution.amount)) }
        });
      }
    }
  }

  contribution.status = params.status;
  await contribution.save();

  return {
    id: contribution._id.toString(),
    userId: contribution.user ? contribution.user.toString() : null,
    bookId: contribution.book.toString(),
    amount: contribution.amount,
    reward: contribution.reward,
    contributorName: contribution.contributorName,
    isPublic: contribution.isPublic,
    status: contribution.status
  };
}

export async function listAdminBooks() {
  await connectToDatabase();

  const books = await BookModel.find(
    {},
    {
      title: 1,
      slug: 1,
      subtitle: 1,
      description: 1,
      price: 1,
      saleType: 1,
      stock: 1,
      fundingGoal: 1,
      fundingRaised: 1,
      coverImage: 1,
      releaseDate: 1,
      excerptUrl: 1
    }
  )
    .sort({ _id: -1 })
    .lean();

  return books.map((book) => ({
    id: book._id.toString(),
    title: book.title,
    slug: book.slug,
    subtitle: book.subtitle,
    description: book.description,
    price: book.price,
    saleType: book.saleType,
    stock: book.stock,
    fundingGoal: book.fundingGoal,
    fundingRaised: book.fundingRaised,
    coverImage: book.coverImage,
    releaseDate: book.releaseDate,
    excerptUrl: book.excerptUrl
  }));
}

export async function deleteBookById(bookId: string) {
  await connectToDatabase();

  const deleted = await BookModel.findByIdAndDelete(bookId).lean();
  if (!deleted) {
    throw new ApiError("Book not found", 404);
  }

  return { id: deleted._id.toString() };
}

export async function updateBookById(params: {
  bookId: string;
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  saleType?: "direct" | "preorder" | "crowdfunding";
  releaseDate?: string;
  excerptUrl?: string;
  price?: number;
  stock?: number;
  fundingGoal?: number;
  fundingRaised?: number;
}) {
  await connectToDatabase();

  const current = await BookModel.findById(params.bookId, {
    saleType: 1,
    stock: 1,
    fundingGoal: 1
  }).lean();
  if (!current) {
    throw new ApiError("Book not found", 404);
  }

  const nextSaleType = params.saleType ?? current.saleType;
  const nextStock = params.stock ?? current.stock;
  const nextFundingGoal = params.fundingGoal ?? current.fundingGoal;

  if ((nextSaleType === "direct" || nextSaleType === "preorder") && (nextStock === undefined || nextStock === null)) {
    throw new ApiError("stock is required for direct/preorder books", 400);
  }

  if (nextSaleType === "crowdfunding" && (nextFundingGoal === undefined || nextFundingGoal === null)) {
    throw new ApiError("fundingGoal is required for crowdfunding books", 400);
  }

  const updates: Record<string, unknown> = {};
  if (params.title !== undefined) updates.title = params.title;
  if (params.slug !== undefined) updates.slug = params.slug.toLowerCase();
  if (params.subtitle !== undefined) updates.subtitle = params.subtitle;
  if (params.description !== undefined) updates.description = params.description;
  if (params.coverImage !== undefined) updates.coverImage = params.coverImage;
  if (params.saleType !== undefined) updates.saleType = params.saleType;
  if (params.releaseDate !== undefined)
    updates.releaseDate = params.releaseDate ? new Date(params.releaseDate) : null;
  if (params.excerptUrl !== undefined) updates.excerptUrl = params.excerptUrl;
  if (params.price !== undefined) updates.price = params.price;
  if (params.stock !== undefined) updates.stock = params.stock;
  if (params.fundingGoal !== undefined) updates.fundingGoal = params.fundingGoal;
  if (params.fundingRaised !== undefined) updates.fundingRaised = params.fundingRaised;

  const book = await BookModel.findByIdAndUpdate(params.bookId, updates, {
    new: true,
    projection: {
      title: 1,
      slug: 1,
      subtitle: 1,
      description: 1,
      price: 1,
      saleType: 1,
      stock: 1,
      fundingGoal: 1,
      fundingRaised: 1,
      coverImage: 1,
      releaseDate: 1,
      excerptUrl: 1
    }
  }).lean();

  if (!book) {
    throw new ApiError("Book not found", 404);
  }

  return {
    id: book._id.toString(),
    title: book.title,
    slug: book.slug,
    subtitle: book.subtitle,
    description: book.description,
    price: book.price,
    saleType: book.saleType,
    stock: book.stock,
    fundingGoal: book.fundingGoal,
    fundingRaised: book.fundingRaised,
    coverImage: book.coverImage,
    releaseDate: book.releaseDate,
    excerptUrl: book.excerptUrl
  };
}

export async function getAdminStats() {
  await connectToDatabase();

  const [
    usersCount,
    booksCount,
    ordersCount,
    contributionsCount,
    pendingCommentsCount,
    paidRevenueAgg,
    paidContributionsAgg,
    salesByTypeAgg,
    topBooksAgg,
    campaignFundingAgg
  ] = await Promise.all([
    UserModel.countDocuments({}),
    BookModel.countDocuments({}),
    OrderModel.countDocuments({}),
    ContributionModel.countDocuments({}),
    CommentModel.countDocuments({ status: "pending" }),
    OrderModel.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    ContributionModel.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    OrderModel.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$saleType", count: { $sum: 1 }, total: { $sum: "$total" } } }
    ]),
    OrderModel.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.book",
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] } }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      {
        $project: {
          _id: 0,
          bookId: { $toString: "$_id" },
          title: { $ifNull: [{ $arrayElemAt: ["$book.title", 0] }, "Ouvrage supprimé"] },
          quantitySold: 1,
          revenue: 1
        }
      }
    ]),
    ContributionModel.aggregate([
      { $match: { status: { $in: ["pending", "paid"] } } },
      {
        $group: {
          _id: "$book",
          collected: { $sum: "$amount" }
        }
      },
      { $sort: { collected: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      {
        $project: {
          _id: 0,
          bookId: { $toString: "$_id" },
          title: { $ifNull: [{ $arrayElemAt: ["$book.title", 0] }, "Campagne supprimée"] },
          collected: 1,
          goal: { $ifNull: [{ $arrayElemAt: ["$book.fundingGoal", 0] }, 0] }
        }
      }
    ])
  ]);

  const salesByType = ["direct", "preorder", "crowdfunding"].map((type) => {
    const found = salesByTypeAgg.find((item) => item._id === type);
    return {
      type,
      count: found?.count ?? 0,
      total: found?.total ?? 0
    };
  });

  return {
    usersCount,
    booksCount,
    ordersCount,
    contributionsCount,
    pendingCommentsCount,
    paidRevenue: paidRevenueAgg[0]?.total ?? 0,
    paidContributions: paidContributionsAgg[0]?.total ?? 0,
    salesByType,
    topBooks: topBooksAgg,
    campaignFunding: campaignFundingAgg
  };
}

export async function bootstrapAdminByEmail(params: { email: string; secret: string }) {
  const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!expectedSecret) {
    throw new ApiError("ADMIN_BOOTSTRAP_SECRET is not configured", 500);
  }

  if (params.secret !== expectedSecret) {
    throw new ApiError("Invalid bootstrap secret", 401);
  }

  await connectToDatabase();

  const user = await UserModel.findOneAndUpdate(
    { email: params.email.toLowerCase() },
    { role: "admin" },
    { new: true, projection: { name: 1, email: 1, role: 1 } }
  ).lean();

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function listAdminPromos() {
  await connectToDatabase();
  const promos = await PromoCodeModel.find({})
    .sort({ _id: -1 })
    .limit(300)
    .lean();

  return promos.map((promo) => ({
    id: promo._id.toString(),
    code: promo.code,
    type: promo.type,
    value: promo.value,
    minSubtotal: promo.minSubtotal ?? 0,
    maxDiscount: promo.maxDiscount,
    usageLimit: promo.usageLimit,
    usedCount: promo.usedCount ?? 0,
    active: promo.active,
    expiresAt: promo.expiresAt
  }));
}

export async function createPromo(params: {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
}) {
  await connectToDatabase();

  const promo = await PromoCodeModel.create({
    code: params.code.toUpperCase(),
    type: params.type,
    value: params.value,
    minSubtotal: params.minSubtotal,
    maxDiscount: params.maxDiscount,
    usageLimit: params.usageLimit,
    expiresAt: params.expiresAt ? new Date(params.expiresAt) : undefined
  });

  return {
    id: promo._id.toString(),
    code: promo.code,
    type: promo.type,
    value: promo.value,
    minSubtotal: promo.minSubtotal ?? 0,
    maxDiscount: promo.maxDiscount,
    usageLimit: promo.usageLimit,
    usedCount: promo.usedCount ?? 0,
    active: promo.active,
    expiresAt: promo.expiresAt
  };
}

export async function updatePromo(params: { promoId: string; active?: boolean }) {
  await connectToDatabase();

  const updates: Record<string, unknown> = {};
  if (params.active !== undefined) {
    updates.active = params.active;
  }

  const promo = await PromoCodeModel.findByIdAndUpdate(params.promoId, updates, { new: true }).lean();
  if (!promo) {
    throw new ApiError("Promo not found", 404);
  }

  return {
    id: promo._id.toString(),
    code: promo.code,
    type: promo.type,
    value: promo.value,
    minSubtotal: promo.minSubtotal ?? 0,
    maxDiscount: promo.maxDiscount,
    usageLimit: promo.usageLimit,
    usedCount: promo.usedCount ?? 0,
    active: promo.active,
    expiresAt: promo.expiresAt
  };
}
