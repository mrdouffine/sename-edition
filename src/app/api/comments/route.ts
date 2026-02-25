import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { createComment, listPublicComments } from "@/lib/services/commentService";
import { parseCommentPayload } from "@/lib/validation/comment";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      throw new ApiError("Missing bookId query param", 400);
    }

    const comments = await listPublicComments(bookId);
    return jsonSuccess(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "comments:create",
      limit: 15,
      windowMs: 10 * 60 * 1000,
      message: "Trop de commentaires envoyés. Réessayez plus tard."
    });

    const session = requireAuth(request);
    requireRole(session, ["client"]);
    const payload = parseCommentPayload(await readJson(request));

    const comment = await createComment({
      ...payload,
      userId: session.sub
    });

    return jsonSuccess(comment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
