import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/services/adminAuditService";
import { runScheduledBookNotifications } from "@/lib/services/emailService";

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const result = await runScheduledBookNotifications();

    await logAdminAction({
      adminUserId: session.sub,
      action: "run_notifications",
      entity: "notifications",
      payload: result
    });

    return jsonSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
