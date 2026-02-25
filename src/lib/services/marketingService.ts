import { ApiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import AbandonedCartModel from "@/models/AbandonedCart";
import NewsletterSubscriptionModel from "@/models/NewsletterSubscription";
import PromoCodeModel from "@/models/PromoCode";

export async function validatePromoCode(params: { code: string; subtotal: number }) {
  await connectToDatabase();

  const normalized = params.code.trim().toUpperCase();
  const promo = await PromoCodeModel.findOne({ code: normalized, active: true }).lean();
  if (!promo) {
    throw new ApiError("Code promo invalide", 404);
  }

  const now = new Date();
  if (promo.expiresAt && promo.expiresAt <= now) {
    throw new ApiError("Code promo expiré", 400);
  }
  if (promo.usageLimit !== undefined && promo.usedCount >= promo.usageLimit) {
    throw new ApiError("Code promo épuisé", 400);
  }
  if (params.subtotal < promo.minSubtotal) {
    throw new ApiError(
      `Montant minimum requis: ${promo.minSubtotal.toFixed(2)} €`,
      400
    );
  }

  let discount = 0;
  if (promo.type === "percent") {
    discount = (params.subtotal * promo.value) / 100;
    if (promo.maxDiscount !== undefined) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  } else {
    discount = promo.value;
  }
  discount = Math.max(0, Math.min(discount, params.subtotal));

  return {
    code: promo.code,
    discount,
    discountType: promo.type
  };
}

export async function markPromoCodeUsed(code: string) {
  await connectToDatabase();
  await PromoCodeModel.findOneAndUpdate({ code: code.toUpperCase() }, { $inc: { usedCount: 1 } });
}

export async function subscribeNewsletter(params: { email: string; source?: string }) {
  await connectToDatabase();

  const email = params.email.toLowerCase();
  const subscription = await NewsletterSubscriptionModel.findOneAndUpdate(
    { email },
    { email, active: true, source: params.source ?? "site" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    id: subscription?._id.toString() ?? "",
    email,
    active: true
  };
}

export async function saveAbandonedCart(params: {
  userId?: string;
  email?: string;
  subtotal: number;
  items: Array<{
    bookId: string;
    slug: string;
    title: string;
    quantity: number;
    unitPrice: number;
    saleType: "direct" | "preorder" | "crowdfunding";
  }>;
}) {
  await connectToDatabase();

  if (params.items.length === 0) {
    return { saved: false };
  }

  await AbandonedCartModel.create({
    user: params.userId,
    email: params.email?.toLowerCase(),
    subtotal: params.subtotal,
    items: params.items,
    status: "open"
  });

  return { saved: true };
}

export async function markCartsRecovered(userId: string) {
  await connectToDatabase();
  await AbandonedCartModel.updateMany(
    { user: userId, status: "open" },
    { status: "recovered", recoveredAt: new Date() }
  );
}
