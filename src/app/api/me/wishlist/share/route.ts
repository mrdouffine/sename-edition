import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { createWishlistShare } from "@/lib/services/wishlistShareService";

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const result = await createWishlistShare(session.sub);
    return jsonSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
