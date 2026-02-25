import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { sendOrderConfirmationEmail } from "@/lib/services/emailService";
import { markPromoCodeUsed } from "@/lib/services/marketingService";
import { recordPaymentTransaction } from "@/lib/services/paymentAuditService";
import { markOrderAsPaid } from "@/lib/services/orderService";
import { assertAmountCentsMatch, retrieveStripeCheckoutSession } from "@/lib/services/paymentService";
import OrderModel from "@/models/Order";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:stripe:complete",
      limit: 30,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    const body = await readJson(request);
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";

    if (!orderId || !sessionId) {
      throw new ApiError("orderId and sessionId are required", 400);
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
    if (order.paymentMethod !== "stripe") {
      throw new ApiError("Order payment method must be stripe", 409);
    }
    if (typeof order.paymentReference === "string" && order.paymentReference && order.paymentReference !== sessionId) {
      throw new ApiError("Stripe session does not match this order", 409);
    }

    const checkoutSession = await retrieveStripeCheckoutSession(sessionId);
    const paymentStatus = checkoutSession.payment_status;
    const checkoutStatus = checkoutSession.status;
    const sessionOrderId =
      (typeof checkoutSession.client_reference_id === "string" && checkoutSession.client_reference_id) ||
      (typeof checkoutSession.metadata === "object" &&
      checkoutSession.metadata &&
      typeof (checkoutSession.metadata as Record<string, unknown>).orderId === "string"
        ? ((checkoutSession.metadata as Record<string, unknown>).orderId as string)
        : "");
    const currency = typeof checkoutSession.currency === "string" ? checkoutSession.currency.toLowerCase() : "";
    const amountTotal = typeof checkoutSession.amount_total === "number" ? checkoutSession.amount_total : null;
    const customerEmail =
      typeof checkoutSession.customer_email === "string"
        ? checkoutSession.customer_email.toLowerCase()
        : "";

    if (sessionOrderId !== order._id.toString()) {
      throw new ApiError("Stripe session does not match this order", 409);
    }
    if (checkoutStatus !== "complete") {
      throw new ApiError("Stripe checkout is not complete", 409);
    }
    if (paymentStatus !== "paid") {
      throw new ApiError("Stripe payment is not completed", 409);
    }
    if (currency !== "eur") {
      throw new ApiError("Stripe currency mismatch", 409);
    }
    if (amountTotal === null) {
      throw new ApiError("Stripe amount is missing", 409);
    }
    assertAmountCentsMatch(order.total, amountTotal);
    if (customerEmail && customerEmail !== session.email.toLowerCase()) {
      throw new ApiError("Stripe customer mismatch", 409);
    }

    const finalized = await markOrderAsPaid({
      orderId: order._id.toString(),
      paymentMethod: "stripe",
      transactionId:
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : `stripe_${Date.now()}`,
      paymentReference: sessionId
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
      provider: "stripe",
      kind: "payment",
      providerReference: sessionId,
      status: "succeeded",
      amount: finalized.total,
      currency: "EUR"
    });

    return jsonSuccess(finalized);
  } catch (error) {
    return handleApiError(error);
  }
}
