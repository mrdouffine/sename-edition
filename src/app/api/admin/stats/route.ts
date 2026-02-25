import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { getAdminStats } from "@/lib/services/adminService";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const stats = await getAdminStats();
    return jsonSuccess(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
