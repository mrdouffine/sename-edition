import { NextResponse } from "next/server";
import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { toCsv } from "@/lib/format/csv";
import { logAdminAction } from "@/lib/services/adminAuditService";
import { listAdminOrders, updateOrderStatus } from "@/lib/services/adminService";
import { parseUpdateOrderStatusPayload } from "@/lib/validation/admin";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const orders = await listAdminOrders();

    const format = new URL(request.url).searchParams.get("format");
    if (format === "csv") {
      const csv = toCsv(
        orders.map((order) => ({
          id: order.id,
          userId: order.userId,
          total: order.total,
          status: order.status,
          saleType: order.saleType
        }))
      );
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="orders.csv"'
        }
      });
    }

    return jsonSuccess(orders);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const payload = parseUpdateOrderStatusPayload(await readJson(request));
    const order = await updateOrderStatus(payload);

    await logAdminAction({
      adminUserId: session.sub,
      action: "update_status",
      entity: "order",
      entityId: payload.orderId,
      payload: { status: payload.status }
    });

    return jsonSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}
