import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { listMyOrders } from "@/lib/services/meService";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orders = await listMyOrders(session.sub);
    return jsonSuccess(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
