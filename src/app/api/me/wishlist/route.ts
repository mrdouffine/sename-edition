import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { addWishlistItem, listWishlist, removeWishlistItem } from "@/lib/services/meService";
import { parseWishlistPayload } from "@/lib/validation/wishlist";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const wishlist = await listWishlist(session.sub);
    return jsonSuccess(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const payload = parseWishlistPayload(await readJson(request));
    const wishlist = await addWishlistItem(session.sub, payload.bookId);
    return jsonSuccess(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = requireAuth(request);
    const payload = parseWishlistPayload(await readJson(request));
    const wishlist = await removeWishlistItem(session.sub, payload.bookId);
    return jsonSuccess(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}
