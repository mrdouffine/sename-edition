import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { listAdminAuditLogs } from "@/lib/services/adminAuditService";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const logs = await listAdminAuditLogs();
    return jsonSuccess(logs);
  } catch (error) {
    return handleApiError(error);
  }
}
