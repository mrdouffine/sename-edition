import { ApiError } from "@/lib/api";
import {
  asEmail,
  asNumber,
  asObject,
  asOptionalString,
  asString
} from "@/lib/validation/common";

export function parsePromoValidationPayload(input: unknown) {
  const body = asObject(input);

  return {
    code: asString(body.code, "code", { min: 2, max: 40 }),
    subtotal: asNumber(body.subtotal, "subtotal", { min: 0 })
  };
}

export function parseNewsletterPayload(input: unknown) {
  const body = asObject(input);
  return {
    email: asEmail(body.email),
    source: asOptionalString(body.source, "source", 80)
  };
}

export function parseAbandonedCartPayload(input: unknown) {
  const body = asObject(input);
  if (!Array.isArray(body.items)) {
    throw new ApiError("items must be an array", 400);
  }

  const items = body.items.map((rawItem, index) => {
    const item = asObject(rawItem);
    const saleType = asString(item.saleType, `items[${index}].saleType`, {
      min: 5,
      max: 20
    });
    if (!["direct", "preorder", "crowdfunding"].includes(saleType)) {
      throw new ApiError(`items[${index}].saleType is invalid`, 400);
    }

    return {
      bookId: asString(item.bookId, `items[${index}].bookId`, { min: 1, max: 64 }),
      slug: asString(item.slug, `items[${index}].slug`, { min: 1, max: 140 }),
      title: asString(item.title, `items[${index}].title`, { min: 1, max: 300 }),
      quantity: asNumber(item.quantity, `items[${index}].quantity`, { min: 1 }),
      unitPrice: asNumber(item.unitPrice, `items[${index}].unitPrice`, { min: 0 }),
      saleType: saleType as "direct" | "preorder" | "crowdfunding"
    };
  });

  return {
    subtotal: asNumber(body.subtotal, "subtotal", { min: 0 }),
    items
  };
}
