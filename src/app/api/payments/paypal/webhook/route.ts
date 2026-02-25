import { ApiError, handleApiError, jsonSuccess } from "@/lib/api";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { sendOrderConfirmationEmail } from "@/lib/services/emailService";
import { markPromoCodeUsed } from "@/lib/services/marketingService";
import { hasProcessedWebhookEvent, recordPaymentTransaction } from "@/lib/services/paymentAuditService";
import {
  assertAmountCentsMatch,
  verifyPaypalWebhookSignature
} from "@/lib/services/paymentService";
import { markOrderAsPaid, markOrderAsRefunded } from "@/lib/services/orderService";
import OrderModel from "@/models/Order";

function asRecord(value: unknown) {
  return typeof value === "object" && value ? (value as Record<string, unknown>) : null;
}

function parseAmountCents(amount: unknown) {
  if (typeof amount !== "string" && typeof amount !== "number") {
    return null;
  }
  const value = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:paypal:webhook",
      limit: 200,
      windowMs: 10 * 60 * 1000
    });

    const webhookEvent = (await request.json()) as Record<string, unknown>;
    await verifyPaypalWebhookSignature({
      transmissionId: request.headers.get("paypal-transmission-id"),
      transmissionTime: request.headers.get("paypal-transmission-time"),
      certUrl: request.headers.get("paypal-cert-url"),
      authAlgo: request.headers.get("paypal-auth-algo"),
      transmissionSig: request.headers.get("paypal-transmission-sig"),
      webhookEvent
    });

    const eventId = typeof webhookEvent.id === "string" ? webhookEvent.id : "";
    const eventType = typeof webhookEvent.event_type === "string" ? webhookEvent.event_type : "";
    if (!eventId || !eventType) {
      throw new ApiError("Invalid PayPal webhook event", 400);
    }

    if (await hasProcessedWebhookEvent({ provider: "paypal", providerEventId: eventId })) {
      return jsonSuccess({ received: true, duplicate: true });
    }

    const resource = asRecord(webhookEvent.resource);

    if (eventType === "PAYMENT.CAPTURE.COMPLETED" && resource) {
      const captureId = typeof resource.id === "string" ? resource.id : "";
      const status = typeof resource.status === "string" ? resource.status : "";
      const amountObj = asRecord(resource.amount);
      const currency = typeof amountObj?.currency_code === "string" ? amountObj.currency_code.toLowerCase() : "";
      const amountCents = parseAmountCents(amountObj?.value);
      const supplementary = asRecord(resource.supplementary_data);
      const related = asRecord(supplementary?.related_ids);
      const paypalOrderId = typeof related?.order_id === "string" ? related.order_id : "";

      if (!captureId || !paypalOrderId || amountCents === null) {
        throw new ApiError("Invalid PayPal capture payload", 400);
      }

      const order = await OrderModel.findOne({ paymentReference: paypalOrderId }).populate({
        path: "user",
        select: "email name"
      });
      if (!order) {
        throw new ApiError("Order not found", 404);
      }
      if (order.paymentMethod !== "paypal") {
        throw new ApiError("Order payment method must be paypal", 409);
      }
      if (status !== "COMPLETED") {
        throw new ApiError("PayPal payment is not completed", 409);
      }
      if (currency !== "eur") {
        throw new ApiError("PayPal currency mismatch", 409);
      }
      assertAmountCentsMatch(order.total, amountCents);

      if (order.status !== "paid") {
        const finalized = await markOrderAsPaid({
          orderId: order._id.toString(),
          paymentMethod: "paypal",
          transactionId: captureId,
          paymentReference: paypalOrderId
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
          provider: "paypal",
          kind: "payment",
          providerReference: captureId,
          status: "succeeded",
          amount: finalized.total,
          currency: "EUR"
        });
      }
    }

    if (eventType === "PAYMENT.CAPTURE.REFUNDED" && resource) {
      const refundId = typeof resource.id === "string" ? resource.id : "";
      const supplementary = asRecord(resource.supplementary_data);
      const related = asRecord(supplementary?.related_ids);
      const captureId = typeof related?.capture_id === "string" ? related.capture_id : "";
      const amountObj = asRecord(resource.amount);
      const currency = typeof amountObj?.currency_code === "string" ? amountObj.currency_code.toUpperCase() : "EUR";
      const amount = parseAmountCents(amountObj?.value);

      if (captureId) {
        const order = await OrderModel.findOne({ transactionId: captureId });
        if (order && order.status === "paid") {
          const refunded = await markOrderAsRefunded({
            orderId: order._id.toString(),
            paymentReference: refundId || order.paymentReference
          });
          await recordPaymentTransaction({
            orderId: refunded._id.toString(),
            userId: refunded.user.toString(),
            provider: "paypal",
            kind: "refund",
            providerReference: refundId || captureId,
            status: "succeeded",
            amount: typeof amount === "number" ? amount / 100 : undefined,
            currency
          });
        }
      }
    }

    await recordPaymentTransaction({
      provider: "paypal",
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
