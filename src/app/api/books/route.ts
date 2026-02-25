import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/services/adminAuditService";
import type { SaleType } from "@/models/Book";
import { createBook, listBooksByType } from "@/lib/services/bookService";
import { parseCreateBookPayload, parseSaleTypeQuery } from "@/lib/validation/book";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const saleType = parseSaleTypeQuery(searchParams.get("type")) as SaleType;

    const books = await listBooksByType(saleType);
    return jsonSuccess(books);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const payload = parseCreateBookPayload(await readJson(request));
    const book = await createBook(payload);

    await logAdminAction({
      adminUserId: session.sub,
      action: "create",
      entity: "book",
      entityId: book._id?.toString?.(),
      payload
    });

    return jsonSuccess(book, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
