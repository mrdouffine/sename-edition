import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { createFedapayTransaction, getTrustedAppOrigin } from "@/lib/services/paymentService";
import OrderModel from "@/models/Order";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:fedapay:create-transaction",
      limit: 20,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    await connectToDatabase();

    const body = await readJson(request);
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    if (!orderId) {
      throw new ApiError("orderId is required", 400);
    }

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
    const method = (order as any).paymentMethod ?? (order as any).paymentProvider;
    if (method !== "fedapay") {
      throw new ApiError("Order payment method must be fedapay", 409);
    }
    if (!Number.isFinite(order.total) || order.total <= 0) {
      throw new ApiError("Invalid order total", 409);
    }

    const origin = getTrustedAppOrigin(request.url);
    const successUrl = `${origin}/commande/succes?provider=fedapay&orderId=${encodeURIComponent(orderId)}`;

    const { paymentUrl, transactionId, token } = await createFedapayTransaction({
      orderId,
      email: order.email,
      amount: order.total,
      currency: "XOF",
      description: `Commande ${order.invoiceNumber}`,
      callbackUrl: `${origin}/api/payments/fedapay/webhook`,
      returnUrl: successUrl
    });

    order.transactionId = transactionId;
    order.paymentReference = token;
    await order.save();

    return jsonSuccess({ paymentUrl, token, orderId, successUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
