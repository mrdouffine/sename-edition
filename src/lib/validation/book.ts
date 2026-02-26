import { asEnum, asNumber, asObject, asOptionalString, asString } from "@/lib/validation/common";
import { ApiError } from "@/lib/api";

const SALE_TYPES = ["direct", "preorder", "crowdfunding"] as const;

export function parseCreateBookPayload(input: unknown) {
  const body = asObject(input);

  const saleType = asEnum(body.saleType, "saleType", SALE_TYPES);
  const stock = body.stock === undefined ? undefined : asNumber(body.stock, "stock", { min: 0 });
  const fundingGoal =
    body.fundingGoal === undefined
      ? undefined
      : asNumber(body.fundingGoal, "fundingGoal", { min: 0 });

  const releaseDate = body.releaseDate ? new Date(asString(body.releaseDate, "releaseDate")) : undefined;
  if (releaseDate && Number.isNaN(releaseDate.getTime())) {
    throw new ApiError("releaseDate must be a valid date", 400);
  }

  if ((saleType === "direct" || saleType === "preorder") && stock === undefined) {
    throw new ApiError("stock is required for direct/preorder books", 400);
  }

  if (saleType === "crowdfunding" && fundingGoal === undefined) {
    throw new ApiError("fundingGoal is required for crowdfunding books", 400);
  }

  const staticReviews = Array.isArray(body.staticReviews)
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
    title: asString(body.title, "title", { min: 2, max: 200 }),
    subtitle: asOptionalString(body.subtitle, "subtitle", 300),
    slug: asOptionalString(body.slug, "slug", 120)?.toLowerCase(),
    description: asString(body.description, "description", { min: 10, max: 6000 }),
    price: asNumber(body.price, "price", { min: 0 }),
    saleType,
    coverImage: asString(body.coverImage, "coverImage", { min: 5, max: 1000000 }),
    releaseDate,
    isbn: asOptionalString(body.isbn, "isbn", 40),
    pages: body.pages === undefined ? undefined : asNumber(body.pages, "pages", { min: 1 }),
    stock,
    fundingGoal,
    fundingRaised:
      body.fundingRaised === undefined
        ? undefined
        : asNumber(body.fundingRaised, "fundingRaised", { min: 0 }),
    excerptUrl: asOptionalString(body.excerptUrl, "excerptUrl", 1000000),
    authorName: asOptionalString(body.authorName, "authorName", 200),
    tags: Array.isArray(body.tags)
      ? body.tags.map((tag, index) => asString(tag, `tags[${index}]`, { min: 1, max: 40 }))
      : [],
    galleryImages: Array.isArray(body.galleryImages)
      ? body.galleryImages.map((url, index) =>
        asString(url, `galleryImages[${index}]`, { min: 5, max: 1000000 })
      )
      : [],
    staticReviews
  };
}

export function parseSaleTypeQuery(value: string | null) {
  if (!value) {
    throw new ApiError("Missing type query param", 400);
  }

  return asEnum(value, "type", SALE_TYPES);
}
