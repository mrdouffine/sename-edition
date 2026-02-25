import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { addCartItem, getCart } from "@/lib/services/cartService";
import { parseCartItemPayload } from "@/lib/validation/cart";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const cart = await getCart(session.sub);
    return jsonSuccess(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const payload = parseCartItemPayload(await request.json());
    const cart = await addCartItem({
      userId: session.sub,
      bookId: payload.bookId,
      quantity: payload.quantity
    });
    return jsonSuccess(cart);
  } catch (error) {
    return handleApiError(error);
  }
}
