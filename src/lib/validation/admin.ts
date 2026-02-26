import {
  asEnum,
  asNumber,
  asObject,
  asObjectId,
  asOptionalString,
  asString
} from "@/lib/validation/common";
import { ApiError } from "@/lib/api";

const USER_ROLES = ["client", "admin"] as const;
const ORDER_STATUS = ["pending", "paid", "cancelled", "refunded"] as const;
const COMMENT_STATUS = ["pending", "approved", "rejected"] as const;
const CONTRIBUTION_STATUS = ["pending", "paid", "refunded"] as const;
const SALE_TYPES = ["direct", "preorder", "crowdfunding"] as const;
const PROMO_TYPES = ["percent", "fixed"] as const;

export function parseUpdateUserRolePayload(input: unknown) {
  const body = asObject(input);

  return {
    userId: asObjectId(body.userId, "userId"),
    role: asEnum(body.role, "role", USER_ROLES)
  };
}

export function parseUpdateOrderStatusPayload(input: unknown) {
  const body = asObject(input);

  return {
    orderId: asObjectId(body.orderId, "orderId"),
    status: asEnum(body.status, "status", ORDER_STATUS)
  };
}

export function parseUpdateCommentStatusPayload(input: unknown) {
  const body = asObject(input);

  return {
    commentId: asObjectId(body.commentId, "commentId"),
    status: asEnum(body.status, "status", COMMENT_STATUS)
  };
}

export function parseUpdateContributionStatusPayload(input: unknown) {
  const body = asObject(input);

  return {
    contributionId: asObjectId(body.contributionId, "contributionId"),
    status: asEnum(body.status, "status", CONTRIBUTION_STATUS)
  };
}

export function parseDeleteBookPayload(input: unknown) {
  const body = asObject(input);

  return {
    bookId: asObjectId(body.bookId, "bookId")
  };
}

export function parseUpdateBookPayload(input: unknown) {
  const body = asObject(input);

  const staticReviews = body.staticReviews === undefined
    ? undefined
    : Array.isArray(body.staticReviews)
      ? body.staticReviews.map((review, index) => {
        const reviewObj = asObject(review);
        if (Array.isArray(body.staticReviews) && body.staticReviews.length > 4) {
          throw new ApiError("Maximum 4 static reviews allowed", 400);
        }
        return {
          name: asString(reviewObj.name, `staticReviews[${index}].name`, { min: 2, max: 120 }),
          role: asOptionalString(reviewObj.role, `staticReviews[${index}].role`, 100),
          content: asString(reviewObj.content, `staticReviews[${index}].content`, { min: 2, max: 1000 }),
          rating: asNumber(reviewObj.rating, `staticReviews[${index}].rating`, { min: 1, max: 5 }),
          order: asNumber(reviewObj.order, `staticReviews[${index}].order`, { min: 1 })
        };
      })
      : [];

  return {
    bookId: asObjectId(body.bookId, "bookId"),
    title: asOptionalString(body.title, "title", 200),
    slug: asOptionalString(body.slug, "slug", 120),
    subtitle: asOptionalString(body.subtitle, "subtitle", 300),
    description: asOptionalString(body.description, "description", 6000),
    coverImage: asOptionalString(body.coverImage, "coverImage", 1000000),
    saleType:
      body.saleType === undefined ? undefined : asEnum(body.saleType, "saleType", SALE_TYPES),
    releaseDate: body.releaseDate === undefined ? undefined : asString(body.releaseDate, "releaseDate", { min: 4, max: 40 }),
    excerptUrl: asOptionalString(body.excerptUrl, "excerptUrl", 1000000),
    price: body.price === undefined ? undefined : asNumber(body.price, "price", { min: 0 }),
    stock: body.stock === undefined ? undefined : asNumber(body.stock, "stock", { min: 0 })
    ,
    fundingGoal:
      body.fundingGoal === undefined
        ? undefined
        : asNumber(body.fundingGoal, "fundingGoal", { min: 0 }),
    fundingRaised:
      body.fundingRaised === undefined
        ? undefined
        : asNumber(body.fundingRaised, "fundingRaised", { min: 0 }),
    staticReviews
  };
}

export function parseBootstrapAdminPayload(input: unknown) {
  const body = asObject(input);

  return {
    email: asString(body.email, "email", { min: 3, max: 320 }).toLowerCase(),
    secret: asString(body.secret, "secret", { min: 8, max: 200 })
  };
}

export function parseCreatePromoPayload(input: unknown) {
  const body = asObject(input);
  return {
    code: asString(body.code, "code", { min: 2, max: 40 }).toUpperCase(),
    type: asEnum(body.type, "type", PROMO_TYPES),
    value: asNumber(body.value, "value", { min: 0 }),
    minSubtotal:
      body.minSubtotal === undefined ? 0 : asNumber(body.minSubtotal, "minSubtotal", { min: 0 }),
    maxDiscount:
      body.maxDiscount === undefined ? undefined : asNumber(body.maxDiscount, "maxDiscount", { min: 0 }),
    usageLimit:
      body.usageLimit === undefined ? undefined : asNumber(body.usageLimit, "usageLimit", { min: 1 }),
    expiresAt:
      body.expiresAt === undefined ? undefined : asString(body.expiresAt, "expiresAt", { min: 4, max: 40 })
  };
}

export function parseUpdatePromoPayload(input: unknown) {
  const body = asObject(input);
  let active: boolean | undefined;
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      throw new ApiError("active must be a boolean", 400);
    }
    active = body.active;
  }
  return {
    promoId: asObjectId(body.promoId, "promoId"),
    active
  };
}
