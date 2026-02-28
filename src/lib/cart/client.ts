export type CartItem = {
  bookId: string;
  slug: string;
  title: string;
  authorName?: string;
  coverImage: string;
  description?: string;
  subtitle?: string;
  coverVariant?: "light" | "dark";
  price: number;
  quantity: number;
  saleType: "direct" | "preorder" | "crowdfunding";
};

const CART_KEY = "livreo_cart";

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const current = getCartItems();
  const existing = current.find((cartItem) => cartItem.bookId === item.bookId);

  let next: CartItem[];
  if (existing) {
    next = current.map((cartItem) =>
      cartItem.bookId === item.bookId
        ? { ...cartItem, quantity: Math.max(1, cartItem.quantity + quantity) }
        : cartItem
    );
  } else {
    next = [...current, { ...item, quantity: Math.max(1, quantity) }];
  }

  saveCartItems(next);
  return next;
}

export function updateCartItemQuantity(bookId: string, quantity: number) {
  const safeQuantity = Math.max(1, quantity);
  const current = getCartItems();
  const next = current.map((item) =>
    item.bookId === bookId ? { ...item, quantity: safeQuantity } : item
  );
  saveCartItems(next);
  return next;
}

export function removeCartItem(bookId: string) {
  const current = getCartItems();
  const next = current.filter((item) => item.bookId !== bookId);
  saveCartItems(next);
  return next;
}

export function clearCartItems() {
  saveCartItems([]);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export async function syncCartWithBackend() {
  const items = getCartItems();
  if (items.length === 0) {
    return;
  }

  try {
    const response = await fetch("/api/me/cart/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: items.map((item) => ({
          bookId: item.bookId,
          quantity: item.quantity,
        })),
      }),
    });

    if (response.ok) {
      // Once synced, we can keep the local ones or rely on the backend.
      // But clearing them might be safer since we've already synced.
      // However, the rest of the app relies on localStorage.
      // So let's keep them in localStorage for now to avoid flickering.
    }
  } catch (error) {
    console.error("Failed to sync cart with backend:", error);
  }
}
