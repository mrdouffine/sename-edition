import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { createPaypalOrder, getTrustedAppOrigin } from "@/lib/services/paymentService";
import OrderModel from "@/models/Order";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:paypal:create-order",
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
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new ApiError("Order not found", 404);
    }
    if (order.user.toString() !== session.sub) {
      throw new ApiError("Forbidden", 403);
    }
    if (order.status !== "pending") {
      throw new ApiError("Only pending orders can be paid", 409);
    }
    if (order.paymentMethod !== "paypal") {
      throw new ApiError("Order payment method must be paypal", 409);
    }
    if (!Number.isFinite(order.total) || order.total <= 0) {
      throw new ApiError("Invalid order total", 409);
    }

    const origin = getTrustedAppOrigin(request.url);
    const paypalOrder = await createPaypalOrder({
      orderId: order._id.toString(),
      total: order.total,
      successUrl: `${origin}/commande/paypal/succes?orderId=${order._id.toString()}`,
      cancelUrl: `${origin}/commande/annulee?provider=paypal&orderId=${order._id.toString()}`
    });

    await OrderModel.findByIdAndUpdate(order._id, {
      paymentReference: paypalOrder.paypalOrderId
    });

    return jsonSuccess(paypalOrder);
  } catch (error) {
    return handleApiError(error);
  }
}
