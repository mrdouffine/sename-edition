import { NextResponse } from "next/server";
import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { toCsv } from "@/lib/format/csv";
import { logAdminAction } from "@/lib/services/adminAuditService";
import { listAdminContributions, updateContributionStatus } from "@/lib/services/adminService";
import { parseUpdateContributionStatusPayload } from "@/lib/validation/admin";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const contributions = await listAdminContributions();

    const format = new URL(request.url).searchParams.get("format");
    if (format === "csv") {
      const csv = toCsv(
        contributions.map((contribution) => ({
          id: contribution.id,
          userId: contribution.userId ?? "",
          bookId: contribution.bookId,
          amount: contribution.amount,
          reward: contribution.reward ?? "",
          status: contribution.status
        }))
      );
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="contributions.csv"'
        }
      });
    }

    return jsonSuccess(contributions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const payload = parseUpdateContributionStatusPayload(await readJson(request));
    const contribution = await updateContributionStatus(payload);

    await logAdminAction({
      adminUserId: session.sub,
      action: "update_status",
      entity: "contribution",
      entityId: payload.contributionId,
      payload: { status: payload.status }
    });

    return jsonSuccess(contribution);
  } catch (error) {
    return handleApiError(error);
  }
}
