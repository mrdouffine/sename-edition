import { ApiError, handleApiError, jsonSuccess } from "@/lib/api";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { sendOrderConfirmationEmail } from "@/lib/services/emailService";
import { markPromoCodeUsed } from "@/lib/services/marketingService";
import { hasProcessedWebhookEvent, recordPaymentTransaction } from "@/lib/services/paymentAuditService";
import {
  assertAmountCentsMatch,
  verifyStripeWebhookSignature
} from "@/lib/services/paymentService";
import { markOrderAsPaid, markOrderAsRefunded } from "@/lib/services/orderService";
import OrderModel from "@/models/Order";

function asRecord(value: unknown) {
  return typeof value === "object" && value ? (value as Record<string, unknown>) : null;
}

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:stripe:webhook",
      limit: 200,
      windowMs: 10 * 60 * 1000
    });

    const rawBody = await request.text();
    verifyStripeWebhookSignature({
      rawBody,
      signatureHeader: request.headers.get("stripe-signature")
    });

    const event = JSON.parse(rawBody) as Record<string, unknown>;
    const eventId = typeof event.id === "string" ? event.id : "";
    const eventType = typeof event.type === "string" ? event.type : "";
    if (!eventId || !eventType) {
      throw new ApiError("Invalid Stripe webhook event", 400);
    }

    if (await hasProcessedWebhookEvent({ provider: "stripe", providerEventId: eventId })) {
      return jsonSuccess({ received: true, duplicate: true });
    }

    const data = asRecord(event.data);
    const object = asRecord(data?.object);

    if (eventType === "checkout.session.completed" && object) {
      const orderId =
        (typeof object.client_reference_id === "string" && object.client_reference_id) ||
        (asRecord(object.metadata) && typeof asRecord(object.metadata)?.orderId === "string"
          ? (asRecord(object.metadata)?.orderId as string)
          : "");
      const paymentStatus = typeof object.payment_status === "string" ? object.payment_status : "";
      const checkoutStatus = typeof object.status === "string" ? object.status : "";
      const currency = typeof object.currency === "string" ? object.currency.toLowerCase() : "";
      const amountTotal = typeof object.amount_total === "number" ? object.amount_total : null;
      const paymentIntent = typeof object.payment_intent === "string" ? object.payment_intent : "";
      const sessionId = typeof object.id === "string" ? object.id : "";

      if (!orderId || !paymentIntent || !sessionId || amountTotal === null) {
        throw new ApiError("Invalid Stripe checkout payload", 400);
      }

      const order = await OrderModel.findById(orderId).populate({ path: "user", select: "email name" });
      if (!order) {
        throw new ApiError("Order not found", 404);
      }
      if (order.paymentMethod !== "stripe") {
        throw new ApiError("Order payment method must be stripe", 409);
      }
      if (typeof order.paymentReference === "string" && order.paymentReference && order.paymentReference !== sessionId) {
        throw new ApiError("Stripe session does not match this order", 409);
      }
      if (checkoutStatus !== "complete" || paymentStatus !== "paid") {
        throw new ApiError("Stripe payment is not completed", 409);
      }
      if (currency !== "eur") {
        throw new ApiError("Stripe currency mismatch", 409);
      }
      assertAmountCentsMatch(order.total, amountTotal);

      if (order.status !== "paid") {
        const finalized = await markOrderAsPaid({
          orderId: order._id.toString(),
          paymentMethod: "stripe",
          transactionId: paymentIntent,
          paymentReference: sessionId
        });

        if (finalized.promoCode) {
          await markPromoCodeUsed(finalized.promoCode);
        }
        const user = order.user as { email?: string; name?: string } | null;
        if (user?.email) {
          await sendOrderConfirmationEmail({
            to: user.email,
            name: user.name ?? "Client",
            orderId: finalized._id.toString(),
            total: finalized.total,
            saleType: finalized.saleType
          });
        }
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
      }
    }

    if (eventType === "charge.refunded" && object) {
      const paymentIntent = typeof object.payment_intent === "string" ? object.payment_intent : "";
      const amountRefunded = typeof object.amount_refunded === "number" ? object.amount_refunded : null;
      const currency = typeof object.currency === "string" ? object.currency.toUpperCase() : "EUR";
      const refundId = typeof object.refund === "string" ? object.refund : undefined;

      if (paymentIntent && amountRefunded !== null) {
        const order = await OrderModel.findOne({ transactionId: paymentIntent });
        if (order && order.status === "paid") {
          const refunded = await markOrderAsRefunded({
            orderId: order._id.toString(),
            paymentReference: refundId ?? order.paymentReference
          });
          await recordPaymentTransaction({
            orderId: refunded._id.toString(),
            userId: refunded.user.toString(),
            provider: "stripe",
            kind: "refund",
            providerReference: refundId ?? paymentIntent,
            status: "succeeded",
            amount: amountRefunded / 100,
            currency
          });
        }
      }
    }

    await recordPaymentTransaction({
      provider: "stripe",
      kind: "webhook",
      providerEventId: eventId,
      providerReference: eventType,
      status: "succeeded",
      payload: { eventType }
    });

    return jsonSuccess({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
