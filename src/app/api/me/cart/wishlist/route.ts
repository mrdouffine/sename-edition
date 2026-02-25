import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { addWishlistToCart } from "@/lib/services/cartService";

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const cart = await addWishlistToCart(session.sub);
    return jsonSuccess(cart);
  } catch (error) {
    return handleApiError(error);
  }
}
