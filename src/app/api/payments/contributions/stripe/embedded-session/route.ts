import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { createStripeEmbeddedCheckoutSession, getTrustedAppOrigin } from "@/lib/services/paymentService";
import ContributionModel from "@/models/Contribution";
import BookModel from "@/models/Book";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:contributions:stripe:embedded-session",
      limit: 20,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    requireRole(session, ["client"]);
    await connectToDatabase();
    const body = await readJson(request);
    const contributionId = typeof body?.contributionId === "string" ? body.contributionId : "";
    if (!contributionId) {
      throw new ApiError("contributionId is required", 400);
    }

    const contribution = await ContributionModel.findById(contributionId);
    if (!contribution) {
      throw new ApiError("Contribution not found", 404);
    }
    if (!contribution.user || contribution.user.toString() !== session.sub) {
      throw new ApiError("Forbidden", 403);
    }
    if (contribution.status !== "pending") {
      throw new ApiError("Only pending contributions can be paid", 409);
    }
    if (contribution.paymentMethod !== "stripe") {
      throw new ApiError("Contribution payment method must be stripe", 409);
    }
    if (!Number.isFinite(contribution.amount) || contribution.amount <= 0) {
      throw new ApiError("Invalid contribution amount", 409);
    }

    const book = await BookModel.findById(contribution.book, { title: 1 }).lean();
    const origin = getTrustedAppOrigin(request.url);
    const stripeSession = await createStripeEmbeddedCheckoutSession({
      orderId: contribution._id.toString(),
      email: session.email,
      successUrl: `${origin}/contribution/succes?contributionId=${contribution._id.toString()}`,
      lineItems: [
        {
          name: `Contribution - ${book?.title ?? "Campagne SENAME EDITION’S"}`,
          unitAmountCents: Math.round(contribution.amount * 100),
          quantity: 1
        }
      ]
    });

    await ContributionModel.findByIdAndUpdate(contribution._id, {
      paymentReference: stripeSession.sessionId
    });

    return jsonSuccess(stripeSession);
  } catch (error) {
    return handleApiError(error);
  }
}
