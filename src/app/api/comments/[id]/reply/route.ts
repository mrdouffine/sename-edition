import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { replyToComment } from "@/lib/services/commentService";
import { parseCommentReplyPayload } from "@/lib/validation/comment";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const { id } = await params;
    const payload = parseCommentReplyPayload(await readJson(request));
    const result = await replyToComment({ commentId: id, reply: payload.reply });

    return jsonSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
