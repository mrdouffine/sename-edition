import { randomBytes } from "node:crypto";
import { ApiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import WishlistShareModel from "@/models/WishlistShare";
import { listWishlist } from "@/lib/services/meService";

export async function createWishlistShare(userId: string) {
  await connectToDatabase();
  const token = randomBytes(20).toString("hex");
  const entry = await WishlistShareModel.create({ user: userId, token });
  return { token: entry.token };
}

export async function getWishlistByToken(token: string) {
  await connectToDatabase();
  const share = await WishlistShareModel.findOne({ token }).lean();
  if (!share) {
    throw new ApiError("Lien de wishlist invalide", 404);
  }

  const wishlist = await listWishlist(share.user.toString());
  return wishlist;
}
