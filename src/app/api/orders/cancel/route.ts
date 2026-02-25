import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { cancelOrder } from "@/lib/services/orderService";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "orders:cancel",
      limit: 20,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    const body = await readJson(request);
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";

    if (!orderId) {
      throw new ApiError("orderId is required", 400);
    }

    const order = await cancelOrder({
      orderId,
      userId: session.sub
    });

    return jsonSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}
