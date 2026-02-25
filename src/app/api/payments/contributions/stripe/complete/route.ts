import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { sendContributionConfirmationEmail } from "@/lib/services/emailService";
import { markContributionAsPaid } from "@/lib/services/contributionService";
import { recordPaymentTransaction } from "@/lib/services/paymentAuditService";
import { assertAmountCentsMatch, retrieveStripeCheckoutSession } from "@/lib/services/paymentService";
import ContributionModel from "@/models/Contribution";
import BookModel from "@/models/Book";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:contributions:stripe:complete",
      limit: 30,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    requireRole(session, ["client"]);
    await connectToDatabase();
    const body = await readJson(request);
    const contributionId = typeof body?.contributionId === "string" ? body.contributionId : "";
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
    if (!contributionId || !sessionId) {
      throw new ApiError("contributionId and sessionId are required", 400);
    }

    const contribution = await ContributionModel.findById(contributionId);
    if (!contribution) {
      throw new ApiError("Contribution not found", 404);
    }
    if (!contribution.user || contribution.user.toString() !== session.sub) {
      throw new ApiError("Forbidden", 403);
    }
    if (contribution.status === "paid") {
      return jsonSuccess(contribution);
    }
    if (contribution.status !== "pending") {
      throw new ApiError("Contribution cannot be paid in its current state", 409);
    }
    if (contribution.paymentMethod !== "stripe") {
      throw new ApiError("Contribution payment method must be stripe", 409);
    }
    if (
      typeof contribution.paymentReference === "string" &&
      contribution.paymentReference &&
      contribution.paymentReference !== sessionId
    ) {
      throw new ApiError("Stripe session does not match this contribution", 409);
    }

    const checkoutSession = await retrieveStripeCheckoutSession(sessionId);
    const paymentStatus = checkoutSession.payment_status;
    const checkoutStatus = checkoutSession.status;
    const sessionContributionId =
      (typeof checkoutSession.client_reference_id === "string" && checkoutSession.client_reference_id) ||
      (typeof checkoutSession.metadata === "object" &&
      checkoutSession.metadata &&
      typeof (checkoutSession.metadata as Record<string, unknown>).orderId === "string"
        ? ((checkoutSession.metadata as Record<string, unknown>).orderId as string)
        : "");
    const currency = typeof checkoutSession.currency === "string" ? checkoutSession.currency.toLowerCase() : "";
    const amountTotal = typeof checkoutSession.amount_total === "number" ? checkoutSession.amount_total : null;
    const customerEmail =
      typeof checkoutSession.customer_email === "string"
        ? checkoutSession.customer_email.toLowerCase()
        : "";

    if (sessionContributionId !== contribution._id.toString()) {
      throw new ApiError("Stripe session does not match this contribution", 409);
    }
    if (checkoutStatus !== "complete") {
      throw new ApiError("Stripe checkout is not complete", 409);
    }
    if (paymentStatus !== "paid") {
      throw new ApiError("Stripe payment is not completed", 409);
    }
    if (currency !== "eur") {
      throw new ApiError("Stripe currency mismatch", 409);
    }
    if (amountTotal === null) {
      throw new ApiError("Stripe amount is missing", 409);
    }
    assertAmountCentsMatch(contribution.amount, amountTotal);
    if (customerEmail && customerEmail !== session.email.toLowerCase()) {
      throw new ApiError("Stripe customer mismatch", 409);
    }

    const finalized = await markContributionAsPaid({
      contributionId: contribution._id.toString(),
      paymentMethod: "stripe",
      transactionId:
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : `stripe_${Date.now()}`,
      paymentReference: sessionId
    });

    const book = await BookModel.findById(finalized.book, { title: 1 }).lean();
    await sendContributionConfirmationEmail({
      to: session.email,
      name: session.name,
      bookTitle: book?.title ?? "Campagne SENAME EDITION’S",
      amount: finalized.amount
    });

    await recordPaymentTransaction({
      userId: finalized.user?.toString(),
      provider: "stripe",
      kind: "payment",
      providerReference: sessionId,
      status: "succeeded",
      amount: finalized.amount,
      currency: "EUR",
      payload: { contributionId: finalized._id.toString() }
    });

    return jsonSuccess(finalized);
  } catch (error) {
    return handleApiError(error);
  }
}
