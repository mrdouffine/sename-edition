import { asNumber, asObject, asObjectId } from "@/lib/validation/common";

export function parseCartItemPayload(input: unknown) {
  const body = asObject(input);

  return {
    bookId: asObjectId(body.bookId, "bookId"),
    quantity: body.quantity === undefined ? undefined : asNumber(body.quantity, "quantity", { min: 1 })
  };
}
