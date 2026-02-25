import { ApiError, handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { sendContributionConfirmationEmail } from "@/lib/services/emailService";
import { markContributionAsPaid } from "@/lib/services/contributionService";
import { recordPaymentTransaction } from "@/lib/services/paymentAuditService";
import { assertAmountCentsMatch, capturePaypalOrder } from "@/lib/services/paymentService";
import ContributionModel from "@/models/Contribution";
import BookModel from "@/models/Book";

function parseAmountToCents(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "payments:contributions:paypal:complete",
      limit: 30,
      windowMs: 10 * 60 * 1000
    });

    const session = requireAuth(request);
    requireRole(session, ["client"]);
    await connectToDatabase();
    const body = await readJson(request);
    const contributionId = typeof body?.contributionId === "string" ? body.contributionId : "";
    const paypalOrderId = typeof body?.paypalOrderId === "string" ? body.paypalOrderId : "";

    if (!contributionId || !paypalOrderId) {
      throw new ApiError("contributionId and paypalOrderId are required", 400);
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
    if (contribution.paymentMethod !== "paypal") {
      throw new ApiError("Contribution payment method must be paypal", 409);
    }
    if (
      typeof contribution.paymentReference === "string" &&
      contribution.paymentReference &&
      contribution.paymentReference !== paypalOrderId
    ) {
      throw new ApiError("PayPal order does not match this contribution", 409);
    }

    const capture = await capturePaypalOrder(paypalOrderId);
    const captureStatus = capture.status;
    const purchaseUnits = Array.isArray(capture.purchase_units)
      ? (capture.purchase_units as Array<Record<string, unknown>>)
      : [];
    const customId = purchaseUnits.length > 0 ? purchaseUnits[0]?.custom_id : "";
    const capturedOrderId = typeof capture.id === "string" ? capture.id : "";
    const amountObject =
      purchaseUnits.length > 0 && typeof purchaseUnits[0] === "object"
        ? (purchaseUnits[0].amount as Record<string, unknown> | undefined)
        : undefined;
    const currencyCode =
      amountObject && typeof amountObject.currency_code === "string"
        ? amountObject.currency_code.toLowerCase()
        : "";
    const amountValue = amountObject?.value;
    const amountCents = parseAmountToCents(amountValue);
    const captures =
      purchaseUnits.length > 0 &&
      typeof purchaseUnits[0] === "object" &&
      typeof purchaseUnits[0].payments === "object" &&
      purchaseUnits[0].payments &&
      Array.isArray((purchaseUnits[0].payments as Record<string, unknown>).captures)
        ? ((purchaseUnits[0].payments as Record<string, unknown>).captures as Array<Record<string, unknown>>)
        : [];
    const captureId = captures.length > 0 && typeof captures[0].id === "string" ? captures[0].id : "";

    if (captureStatus !== "COMPLETED") {
      throw new ApiError("PayPal payment is not completed", 409);
    }
    if (capturedOrderId && capturedOrderId !== paypalOrderId) {
      throw new ApiError("PayPal order does not match this contribution", 409);
    }
    if (typeof customId !== "string" || customId !== contribution._id.toString()) {
      throw new ApiError("PayPal order does not match this contribution", 409);
    }
    if (currencyCode !== "eur") {
      throw new ApiError("PayPal currency mismatch", 409);
    }
    if (amountCents === null) {
      throw new ApiError("PayPal amount is missing", 409);
    }
    if (!captureId) {
      throw new ApiError("PayPal capture ID is missing", 409);
    }
    assertAmountCentsMatch(contribution.amount, amountCents);

    const finalized = await markContributionAsPaid({
      contributionId: contribution._id.toString(),
      paymentMethod: "paypal",
      transactionId: captureId,
      paymentReference: paypalOrderId
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
      provider: "paypal",
      kind: "payment",
      providerReference: paypalOrderId,
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
