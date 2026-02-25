import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { listMyPaymentTransactions } from "@/lib/services/meService";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const transactions = await listMyPaymentTransactions(session.sub);
    return jsonSuccess(transactions);
  } catch (error) {
    return handleApiError(error);
  }
}
