import { handleApiError, jsonSuccess } from "@/lib/api";
import { getWishlistByToken } from "@/lib/services/wishlistShareService";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const wishlist = await getWishlistByToken(token);
    return jsonSuccess(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}
