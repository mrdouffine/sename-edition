import { asNumber, asObject, asObjectId, asOptionalString } from "@/lib/validation/common";
import { ApiError } from "@/lib/api";

export function parseContributionPayload(input: unknown) {
  const body = asObject(input);

  let isPublic = true;
  if (body.isPublic !== undefined) {
    if (typeof body.isPublic !== "boolean") {
      throw new ApiError("isPublic must be a boolean", 400);
    }
    isPublic = body.isPublic;
  }

  return {
    bookId: asObjectId(body.bookId, "bookId"),
    amount: asNumber(body.amount, "amount", { min: 1 }),
    reward: asOptionalString(body.reward, "reward", 300),
    contributorName: asOptionalString(body.contributorName, "contributorName", 120),
    isPublic
  };
}
