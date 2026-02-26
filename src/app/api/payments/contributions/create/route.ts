import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { createPendingContribution } from "@/lib/services/contributionService";
import { createPaypalOrder, getTrustedAppOrigin } from "@/lib/services/paymentService";
import ContributionModel from "@/models/Contribution";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:contributions:create",
      limit: 20,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    requireRole(session, ["client"]);
    await connectToDatabase();
    const body = await readJson(request);
    const bookId = typeof body?.bookId === "string" ? body.bookId : "";
    const amount = typeof body?.amount === "number" ? body.amount : Number(body?.amount);
    const reward = typeof body?.reward === "string" && body.reward.trim() ? body.reward.trim() : undefined;
    const paymentMethod = body?.paymentMethod === "paypal" ? "paypal" : body?.paymentMethod === "mobile_money" ? "mobile_money" : "";

    if (!bookId || !Number.isFinite(amount) || amount <= 0 || !paymentMethod) {
      throw new ApiError("bookId, amount and paymentMethod are required", 400);
    }

    const contribution = await createPendingContribution({
      bookId,
      userId: session.sub,
      amount,
      reward,
      isPublic: true,
      paymentMethod
    });

    const origin = getTrustedAppOrigin(request.url);
    const paypalOrder = await createPaypalOrder({
      orderId: contribution._id.toString(),
      total: contribution.amount,
      successUrl: `${origin}/contribution/paypal/succes?contributionId=${contribution._id.toString()}`,
      cancelUrl: `${origin}/commande/echec?reason=${encodeURIComponent("Paiement contribution annulé.")}&contributionId=${contribution._id.toString()}`
    });

    await ContributionModel.findByIdAndUpdate(contribution._id, {
      paymentReference: paypalOrder.paypalOrderId
    });

    return jsonSuccess({
      provider: "paypal",
      contributionId: contribution._id.toString(),
      redirectUrl: paypalOrder.approvalUrl
    });
  } catch (error) {
    return handleApiError(error);
  }
}
