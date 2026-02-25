import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/services/adminAuditService";
import { listAdminComments, updateCommentStatus } from "@/lib/services/adminService";
import { parseUpdateCommentStatusPayload } from "@/lib/validation/admin";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const comments = await listAdminComments();
    return jsonSuccess(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const payload = parseUpdateCommentStatusPayload(await readJson(request));
    const comment = await updateCommentStatus(payload);

    await logAdminAction({
      adminUserId: session.sub,
      action: "moderate",
      entity: "comment",
      entityId: payload.commentId,
      payload: { status: payload.status }
    });

    return jsonSuccess(comment);
  } catch (error) {
    return handleApiError(error);
  }
}
