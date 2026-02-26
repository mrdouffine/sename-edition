import { ApiError, handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { createPaypalOrder, getTrustedAppOrigin } from "@/lib/services/paymentService";
import OrderModel from "@/models/Order";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertRateLimit({
      request,
      key: "orders:retry-payment",
      limit: 30,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    const { id } = await params;

    await connectToDatabase();
    const order = await OrderModel.findById(id);
    if (!order) {
      throw new ApiError("Order not found", 404);
    }
    if (order.user.toString() !== session.sub) {
      throw new ApiError("Forbidden", 403);
    }
    if (order.status !== "pending") {
      throw new ApiError("Only pending orders can be retried", 409);
    }

    if (order.paymentProvider === "fedapay") {
      return jsonSuccess({
        provider: "fedapay",
        redirectUrl: `/commande/paiement/fedapay?orderId=${order._id.toString()}`
      });
    }

    if (order.paymentProvider === "paypal") {
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

      return jsonSuccess({
        provider: "paypal",
        redirectUrl: paypalOrder.approvalUrl
      });
    }

    throw new ApiError("Payment retry is not supported for this payment method", 409);
  } catch (error) {
    return handleApiError(error);
  }
}
