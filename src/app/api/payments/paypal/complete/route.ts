import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { sendOrderConfirmationEmail } from "@/lib/services/emailService";
import { markPromoCodeUsed } from "@/lib/services/marketingService";
import { recordPaymentTransaction } from "@/lib/services/paymentAuditService";
import { markOrderAsPaid } from "@/lib/services/orderService";
import { assertAmountCentsMatch, capturePaypalOrder } from "@/lib/services/paymentService";
import OrderModel from "@/models/Order";

function parseAmountToCents(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:paypal:complete",
      limit: 30,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    const body = await readJson(request);
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    const paypalOrderId = typeof body?.paypalOrderId === "string" ? body.paypalOrderId : "";

    if (!orderId || !paypalOrderId) {
      throw new ApiError("orderId and paypalOrderId are required", 400);
    }

    await connectToDatabase();
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new ApiError("Order not found", 404);
    }
    if (order.user.toString() !== session.sub) {
      throw new ApiError("Forbidden", 403);
    }
    if (order.status === "paid") {
      return jsonSuccess(order);
    }
    if (order.status !== "pending") {
      throw new ApiError("Order cannot be paid in its current state", 409);
    }
    if (order.paymentProvider !== "paypal") {
      throw new ApiError("Order payment method must be paypal", 409);
    }
    if (typeof order.paymentReference === "string" && order.paymentReference && order.paymentReference !== paypalOrderId) {
      throw new ApiError("PayPal order does not match this order", 409);
    }

    const capture = await capturePaypalOrder(paypalOrderId);
    const captureStatus = capture.status;
    const purchaseUnits = Array.isArray(capture.purchase_units)
      ? (capture.purchase_units as Array<Record<string, unknown>>)
      : [];
    const customId = purchaseUnits.length > 0 ? purchaseUnits[0]?.custom_id : "";
    const capturedOrderId = typeof capture.id === "string" ? capture.id : "";
    const amountObject =
      purchaseUnits.length > 0 && typeof purchaseUnits[0] === "object"
        ? (purchaseUnits[0].amount as Record<string, unknown> | undefined)
        : undefined;
    const currencyCode =
      amountObject && typeof amountObject.currency_code === "string"
        ? amountObject.currency_code.toLowerCase()
        : "";
    const amountValue = amountObject?.value;
    const amountCents = parseAmountToCents(amountValue);
    const captures =
      purchaseUnits.length > 0 &&
        typeof purchaseUnits[0] === "object" &&
        typeof purchaseUnits[0].payments === "object" &&
        purchaseUnits[0].payments &&
        Array.isArray((purchaseUnits[0].payments as Record<string, unknown>).captures)
        ? ((purchaseUnits[0].payments as Record<string, unknown>).captures as Array<Record<string, unknown>>)
        : [];
    const captureId = captures.length > 0 && typeof captures[0].id === "string" ? captures[0].id : "";

    if (captureStatus !== "COMPLETED") {
      throw new ApiError("PayPal payment is not completed", 409);
    }
    if (capturedOrderId && capturedOrderId !== paypalOrderId) {
      throw new ApiError("PayPal order does not match this order", 409);
    }
    if (typeof customId !== "string" || customId !== order._id.toString()) {
      throw new ApiError("PayPal order does not match this order", 409);
    }
    if (currencyCode !== "eur") {
      throw new ApiError("PayPal currency mismatch", 409);
    }
    if (amountCents === null) {
      throw new ApiError("PayPal amount is missing", 409);
    }
    if (!captureId) {
      throw new ApiError("PayPal capture ID is missing", 409);
    }
    assertAmountCentsMatch(order.total, amountCents);

    const finalized = await markOrderAsPaid({
      orderId: order._id.toString(),
      paymentProvider: "paypal",
      transactionId: captureId,
      paymentReference: paypalOrderId
    });

    if (finalized.promoCode) {
      await markPromoCodeUsed(finalized.promoCode);
    }

    await sendOrderConfirmationEmail({
      to: session.email,
      name: session.name,
      orderId: finalized._id.toString(),
      total: finalized.total,
      saleType: finalized.saleType
    });

    await recordPaymentTransaction({
      orderId: finalized._id.toString(),
      userId: finalized.user.toString(),
      provider: "paypal",
      kind: "payment",
      providerReference: paypalOrderId,
      status: "succeeded",
      amount: finalized.total,
      currency: "EUR"
    });

    return jsonSuccess(finalized);
  } catch (error) {
    return handleApiError(error);
  }
}
