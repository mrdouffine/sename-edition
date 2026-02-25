import { ApiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import BookModel from "@/models/Book";
import CartModel, { type CartItem } from "@/models/Cart";
import { listWishlist } from "@/lib/services/meService";

export async function getCart(userId: string) {
  await connectToDatabase();
  const cart = await CartModel.findOne({ user: userId }).lean();
  if (!cart) {
    return { items: [] as CartItem[] };
  }
  return { items: cart.items };
}

export async function addCartItem(params: { userId: string; bookId: string; quantity?: number }) {
  await connectToDatabase();

  const book = await BookModel.findById(params.bookId).lean();
  if (!book) {
    throw new ApiError("Book not found", 404);
  }

  const quantity = Math.max(1, params.quantity ?? 1);
  const cart = await CartModel.findOne({ user: params.userId });

  const item: CartItem = {
    book: book._id,
    quantity,
    unitPrice: book.price ?? 0,
    title: book.title,
    slug: book.slug,
    coverImage: book.coverImage,
    saleType: book.saleType
  };

  if (!cart) {
    const created = await CartModel.create({ user: params.userId, items: [item] });
    return { items: created.items };
  }

  const existing = cart.items.find((cartItem) => cartItem.book.toString() === params.bookId);
  if (existing) {
    existing.quantity = Math.max(1, existing.quantity + quantity);
  } else {
    cart.items.push(item);
  }
  await cart.save();

  return { items: cart.items };
}

export async function addWishlistToCart(userId: string) {
  await connectToDatabase();
  const wishlist = await listWishlist(userId);
  if (!wishlist.length) {
    return { items: [] as CartItem[] };
  }

  const cart = await CartModel.findOne({ user: userId });
  const items: CartItem[] = wishlist.map((book) => ({
    book: book.id as unknown as never,
    quantity: 1,
    unitPrice: book.price ?? 0,
    title: book.title ?? "Ouvrage",
    slug: book.slug ?? "",
    coverImage: book.coverImage ?? "",
    saleType: (book.saleType as CartItem["saleType"]) ?? "direct"
  }));

  if (!cart) {
    const created = await CartModel.create({ user: userId, items });
    return { items: created.items };
  }

  for (const item of items) {
    const existing = cart.items.find((cartItem) => cartItem.book.toString() === String(item.book));
    if (existing) {
      existing.quantity = Math.max(1, existing.quantity + item.quantity);
    } else {
      cart.items.push(item);
    }
  }

  await cart.save();
  return { items: cart.items };
}
