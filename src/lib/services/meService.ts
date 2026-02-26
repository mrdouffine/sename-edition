import { ApiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import BookModel from "@/models/Book";
import ContributionModel from "@/models/Contribution";
import OrderModel from "@/models/Order";
import PaymentTransactionModel from "@/models/PaymentTransaction";
import UserModel from "@/models/User";

export async function getProfile(userId: string) {
  await connectToDatabase();

  const user = await UserModel.findById(userId, { name: 1, email: 1, role: 1, rewardPoints: 1 }).lean();
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    rewardPoints: user.rewardPoints ?? 0
  };
}

export async function updateProfile(userId: string, params: { name?: string; email?: string }) {
  await connectToDatabase();

  const updates: Record<string, unknown> = {};
  if (params.name !== undefined) {
    updates.name = params.name;
  }
  if (params.email !== undefined) {
    updates.email = params.email.toLowerCase();
  }

  if (updates.email) {
    const existing = await UserModel.findOne({
      email: updates.email,
      _id: { $ne: userId }
    }).lean();
    if (existing) {
      throw new ApiError("Email already in use", 409);
    }
  }

  const user = await UserModel.findByIdAndUpdate(userId, updates, {
    new: true,
    projection: { name: 1, email: 1, role: 1, rewardPoints: 1 }
  }).lean();

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    rewardPoints: user.rewardPoints ?? 0
  };
}

export async function listMyOrders(userId: string) {
  await connectToDatabase();

  const orders = await OrderModel.find({ user: userId })
    .sort({ _id: -1 })
    .populate({ path: "items.book", select: "title slug coverImage" })
    .lean();

  return orders.map((order) => ({
    id: order._id.toString(),
    total: order.total,
    status: order.status,
    saleType: order.saleType,
    paymentMethod: (order as any).paymentProvider,
    invoiceNumber: order.invoiceNumber,
    createdAt: (order as { createdAt?: Date }).createdAt ?? null,
    items: order.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      book: item.book
        ? {
          id: (item.book as { _id: { toString(): string } })._id.toString(),
          title: (item.book as { title?: string }).title,
          slug: (item.book as { slug?: string }).slug,
          coverImage: (item.book as { coverImage?: string }).coverImage
        }
        : null
    }))
  }));
}

export async function listMyContributions(userId: string) {
  await connectToDatabase();

  const contributions = await ContributionModel.find({ user: userId })
    .sort({ _id: -1 })
    .populate({ path: "book", select: "title slug coverImage" })
    .lean();

  return contributions.map((contribution) => ({
    id: contribution._id.toString(),
    amount: contribution.amount,
    reward: contribution.reward,
    status: contribution.status,
    book: contribution.book
      ? {
        id: (contribution.book as { _id: { toString(): string } })._id.toString(),
        title: (contribution.book as { title?: string }).title,
        slug: (contribution.book as { slug?: string }).slug,
        coverImage: (contribution.book as { coverImage?: string }).coverImage
      }
      : null
  }));
}

export async function listWishlist(userId: string) {
  await connectToDatabase();

  const user = await UserModel.findById(userId, { wishlist: 1 })
    .populate({ path: "wishlist", select: "title slug coverImage price saleType authorName" })
    .lean();

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];

  return wishlist.map((book) => ({
    id: (book as { _id: { toString(): string } })._id.toString(),
    title: (book as { title?: string }).title,
    slug: (book as { slug?: string }).slug,
    coverImage: (book as { coverImage?: string }).coverImage,
    price: (book as { price?: number }).price,
    saleType: (book as { saleType?: string }).saleType,
    authorName: (book as { authorName?: string }).authorName
  }));
}

export async function addWishlistItem(userId: string, bookId: string) {
  await connectToDatabase();

  const book = await BookModel.findById(bookId).lean();
  if (!book) {
    throw new ApiError("Book not found", 404);
  }

  await UserModel.findByIdAndUpdate(userId, { $addToSet: { wishlist: bookId } });
  return listWishlist(userId);
}

export async function removeWishlistItem(userId: string, bookId: string) {
  await connectToDatabase();

  await UserModel.findByIdAndUpdate(userId, { $pull: { wishlist: bookId } });
  return listWishlist(userId);
}

export async function listMyPaymentTransactions(userId: string) {
  await connectToDatabase();

  const transactions = await PaymentTransactionModel.find(
    { userId },
    {
      provider: 1,
      kind: 1,
      providerReference: 1,
      status: 1,
      amount: 1,
      currency: 1,
      createdAt: 1,
      orderId: 1
    }
  )
    .sort({ _id: -1 })
    .limit(200)
    .lean();

  return transactions.map((tx) => ({
    id: tx._id.toString(),
    orderId: tx.orderId ? tx.orderId.toString() : null,
    provider: tx.provider,
    kind: tx.kind,
    providerReference: tx.providerReference ?? null,
    status: tx.status,
    amount: tx.amount ?? null,
    currency: tx.currency ?? null,
    createdAt: (tx as { createdAt?: Date }).createdAt ?? null
  }));
}
