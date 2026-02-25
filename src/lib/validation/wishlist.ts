import { asObject, asObjectId } from "@/lib/validation/common";

export function parseWishlistPayload(input: unknown) {
  const body = asObject(input);

  return {
    bookId: asObjectId(body.bookId, "bookId")
  };
}
