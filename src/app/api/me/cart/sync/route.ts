import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { syncCart } from "@/lib/services/cartService";

export async function POST(request: Request) {
    try {
        const session = requireAuth(request);
        const body = await request.json();
        const items = body.items as Array<{ bookId: string; quantity: number }>;

        if (!Array.isArray(items)) {
            throw new Error("Invalid payload: items must be an array");
        }

        const cart = await syncCart(session.sub, items);
        return jsonSuccess(cart);
    } catch (error) {
        return handleApiError(error);
    }
}
