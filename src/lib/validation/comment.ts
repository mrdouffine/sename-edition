import { ApiError } from "@/lib/api";
import { asEmail, asObject, asObjectId, asString } from "@/lib/validation/common";

export function parseCommentPayload(input: unknown) {
  const body = asObject(input);

  const ratingRaw = body.rating;
  if (typeof ratingRaw !== "number" || !Number.isFinite(ratingRaw)) {
    throw new ApiError("rating must be a number", 400);
  }
  const rating = Math.max(1, Math.min(5, Math.round(ratingRaw)));

  return {
    bookId: asObjectId(body.bookId, "bookId"),
    rating,
    content: asString(body.content, "content", { min: 2, max: 2000 }),
    reviewerName: asString(body.reviewerName, "reviewerName", { min: 2, max: 120 }),
    reviewerEmail: asEmail(body.reviewerEmail, "reviewerEmail")
  };
}

export function parseCommentReplyPayload(input: unknown) {
  const body = asObject(input);

  return {
    reply: asString(body.reply, "reply", { min: 2, max: 3000 })
  };
}
