import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { optionalAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { sendContributionConfirmationEmail } from "@/lib/services/emailService";
import { createContribution, getCampaignSnapshot } from "@/lib/services/contributionService";
import { asObjectId } from "@/lib/validation/common";
import { parseContributionPayload } from "@/lib/validation/contribution";
import BookModel from "@/models/Book";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = asObjectId(searchParams.get("bookId"), "bookId");
    const snapshot = await getCampaignSnapshot(bookId);
    return jsonSuccess(snapshot);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "contributions:create",
      limit: 20,
      windowMs: 10 * 60 * 1000
    });

    const session = optionalAuth(request);
    const payload = parseContributionPayload(await readJson(request));

    const contribution = await createContribution({
      ...payload,
      userId: session?.sub
    });

    if (session?.email) {
      await connectToDatabase();
      const book = await BookModel.findById(payload.bookId, { title: 1 }).lean();

      await sendContributionConfirmationEmail({
        to: session.email,
        name: session.name,
        bookTitle: book?.title ?? "Campagne SENAME EDITION’S",
        amount: payload.amount
      });
    }

    return jsonSuccess(contribution, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
