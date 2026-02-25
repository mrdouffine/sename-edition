import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/services/adminAuditService";
import { createPromo, listAdminPromos, updatePromo } from "@/lib/services/adminService";
import { parseCreatePromoPayload, parseUpdatePromoPayload } from "@/lib/validation/admin";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const promos = await listAdminPromos();
    return jsonSuccess(promos);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const payload = parseCreatePromoPayload(await readJson(request));
    const promo = await createPromo(payload);

    await logAdminAction({
      adminUserId: session.sub,
      action: "create",
      entity: "promo",
      entityId: promo.id,
      payload
    });

    return jsonSuccess(promo, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    requireRole(session, ["admin"]);

    const payload = parseUpdatePromoPayload(await readJson(request));
    const promo = await updatePromo(payload);

    await logAdminAction({
      adminUserId: session.sub,
      action: "update",
      entity: "promo",
      entityId: payload.promoId,
      payload
    });

    return jsonSuccess(promo);
  } catch (error) {
    return handleApiError(error);
  }
}
