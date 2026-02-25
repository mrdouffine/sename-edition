import { ApiError } from "@/lib/api";
import { asEnum, asNumber, asObject, asObjectId, asOptionalString } from "@/lib/validation/common";

const SALE_TYPES = ["direct", "preorder"] as const;
const PAYMENT_METHODS = ["stripe", "paypal", "mobile_money"] as const;

export function parseOrderPayload(input: unknown) {
  const body = asObject(input);

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new ApiError("items must be a non-empty array", 400);
  }

  const items = body.items.map((rawItem, index) => {
    const item = asObject(rawItem);

    return {
      bookId: asObjectId(item.bookId, `items[${index}].bookId`),
      quantity: asNumber(item.quantity, `items[${index}].quantity`, { min: 1 })
    };
  });

  return {
    saleType: asEnum(body.saleType, "saleType", SALE_TYPES),
    paymentMethod:
      body.paymentMethod === undefined
        ? "stripe"
        : asEnum(body.paymentMethod, "paymentMethod", PAYMENT_METHODS),
    promoCode: asOptionalString(body.promoCode, "promoCode", 40),
    items
  };
}
