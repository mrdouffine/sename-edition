import { NextResponse } from "next/server";
import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { toCsv } from "@/lib/format/csv";
import { logAdminAction } from "@/lib/services/adminAuditService";
import { listAdminUsers, updateUserRole } from "@/lib/services/adminService";
import { parseUpdateUserRolePayload } from "@/lib/validation/admin";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const users = await listAdminUsers();

    const format = new URL(request.url).searchParams.get("format");
    if (format === "csv") {
      const csv = toCsv(
        users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }))
      );
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="users.csv"'
        }
      });
    }

    return jsonSuccess(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const payload = parseUpdateUserRolePayload(await readJson(request));
    const user = await updateUserRole(payload);

    await logAdminAction({
      adminUserId: session.sub,
      action: "update_role",
      entity: "user",
      entityId: payload.userId,
      payload: { role: payload.role }
    });

    return jsonSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
