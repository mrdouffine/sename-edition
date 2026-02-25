import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { listAdminPaymentTransactions } from "@/lib/services/adminService";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const transactions = await listAdminPaymentTransactions();
    return jsonSuccess(transactions);
  } catch (error) {
    return handleApiError(error);
  }
}
