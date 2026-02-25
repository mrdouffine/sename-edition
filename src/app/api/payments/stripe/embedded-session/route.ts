import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { createStripeEmbeddedCheckoutSession, getTrustedAppOrigin } from "@/lib/services/paymentService";
import OrderModel from "@/models/Order";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:stripe:embedded-session",
      limit: 20,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    const body = await readJson(request);
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    if (!orderId) {
      throw new ApiError("orderId is required", 400);
    }

    await connectToDatabase();
    const order = await OrderModel.findById(orderId).populate({
      path: "items.book",
      select: "title"
    });
    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    if (order.user.toString() !== session.sub) {
      throw new ApiError("Forbidden", 403);
    }
    if (order.status !== "pending") {
      throw new ApiError("Only pending orders can be paid", 409);
    }
    if (order.paymentMethod !== "stripe") {
      throw new ApiError("Order payment method must be stripe", 409);
    }

    if (!Number.isFinite(order.total) || order.total <= 0) {
      throw new ApiError("Invalid order total", 409);
    }

    const origin = getTrustedAppOrigin(request.url);
    const stripeSession = await createStripeEmbeddedCheckoutSession({
      orderId: order._id.toString(),
      email: session.email,
      successUrl: `${origin}/commande/succes?orderId=${order._id.toString()}`,
      lineItems: order.items.map((item) => ({
        name: (item.book as { title?: string } | null)?.title ?? "Ouvrage SENAME EDITION’S",
        unitAmountCents: Math.round(item.unitPrice * 100),
        quantity: item.quantity
      }))
    });

    await OrderModel.findByIdAndUpdate(order._id, {
      paymentReference: stripeSession.sessionId
    });

    return jsonSuccess(stripeSession);
  } catch (error) {
    return handleApiError(error);
  }
}
