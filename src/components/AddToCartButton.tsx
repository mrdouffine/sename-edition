"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart/client";
import { getSessionFromToken } from "@/lib/auth/client";
import { normalizeNextPath } from "@/lib/auth/redirect";

type Props = {
  book: {
    bookId: string;
    slug: string;
    title: string;
    authorName?: string;
    coverImage: string;
    description?: string;
    subtitle?: string;
    coverVariant?: "dark" | "light";
    price: number;
    saleType: "direct" | "preorder" | "crowdfunding";
  };
  quantity?: number;
  disabled?: boolean;
  className?: string;
  outOfStockLabel?: string;
};

export default function AddToCartButton({
  book,
  quantity = 1,
  disabled,
  className,
  outOfStockLabel = "RUPTURE DE STOCK"
}: Props) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addToCart(book, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
    router.push("/panier");
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={className}
    >
      {disabled ? outOfStockLabel : added ? "AJOUTÉ" : "AJOUTER AU PANIER"}
    </button>
  );
}
