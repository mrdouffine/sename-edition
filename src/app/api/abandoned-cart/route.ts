import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { optionalAuth } from "@/lib/auth/session";
import { parseAbandonedCartPayload } from "@/lib/validation/marketing";
import { saveAbandonedCart } from "@/lib/services/marketingService";

export async function POST(request: Request) {
  try {
    const session = optionalAuth(request);
    const payload = parseAbandonedCartPayload(await readJson(request));

    const result = await saveAbandonedCart({
      ...payload,
      userId: session?.sub,
      email: session?.email
    });
    return jsonSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
