import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { markCartsRecovered } from "@/lib/services/marketingService";
import { createOrder } from "@/lib/services/orderService";
import { parseOrderPayload } from "@/lib/validation/order";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "orders:create",
      limit: 20,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    const payload = parseOrderPayload(await readJson(request));

    const order = await createOrder({
      ...payload,
      userId: session.sub
    });

    await markCartsRecovered(session.sub);

    return jsonSuccess(order, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
