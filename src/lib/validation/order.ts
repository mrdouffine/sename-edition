import { ApiError } from "@/lib/api";
import { asEnum, asNumber, asObject, asObjectId, asOptionalString, asString } from "@/lib/validation/common";

const SALE_TYPES = ["direct", "preorder"] as const;
const PAYMENT_PROVIDERS = ["fedapay", "paypal"] as const;

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

  const email = asString(body.email, "email", { min: 5, max: 255 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError("email must be a valid email format", 400);
  }

  return {
    saleType: asEnum(body.saleType, "saleType", SALE_TYPES),
    paymentProvider:
      body.paymentProvider === undefined
        ? "fedapay"
        : asEnum(body.paymentProvider, "paymentProvider", PAYMENT_PROVIDERS),
    email,
    promoCode: asOptionalString(body.promoCode, "promoCode", 40),
    items
  };
}
