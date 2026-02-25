import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/services/adminAuditService";
import { deleteBookById, listAdminBooks, updateBookById } from "@/lib/services/adminService";
import { parseDeleteBookPayload, parseUpdateBookPayload } from "@/lib/validation/admin";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const books = await listAdminBooks();
    return jsonSuccess(books);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const payload = parseDeleteBookPayload(await readJson(request));
    const deleted = await deleteBookById(payload.bookId);

    await logAdminAction({
      adminUserId: session.sub,
      action: "delete",
      entity: "book",
      entityId: payload.bookId
    });

    return jsonSuccess(deleted);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const payload = parseUpdateBookPayload(await readJson(request));
    const book = await updateBookById(payload);

    await logAdminAction({
      adminUserId: session.sub,
      action: "update",
      entity: "book",
      entityId: payload.bookId,
      payload: payload
    });

    return jsonSuccess(book);
  } catch (error) {
    return handleApiError(error);
  }
}
