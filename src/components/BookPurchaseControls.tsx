"use client";

import { useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";

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
  disabled?: boolean;
};

export default function BookPurchaseControls({ book, disabled }: Props) {
  const [quantity, setQuantity] = useState(1);

  function decrement() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increment() {
    setQuantity((current) => current + 1);
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row">
      <div className="flex h-12 items-center rounded-lg border-2 border-[#e5e5e0] bg-white sm:h-14">
        <button
          type="button"
          onClick={decrement}
          className="h-full px-4 transition-colors hover:bg-gray-100"
          aria-label="Diminuer"
        >
          <span className="material-symbols-outlined text-sm">remove</span>
        </button>
        <input
          className="w-10 border-none bg-transparent text-center text-sm font-bold focus:ring-0 sm:w-12 sm:text-base"
          type="text"
          inputMode="numeric"
          value={quantity}
          readOnly
          aria-label="Quantité"
        />
        <button
          type="button"
          onClick={increment}
          className="h-full px-4 transition-colors hover:bg-gray-100"
          aria-label="Augmenter"
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>
      <AddToCartButton
        book={book}
        quantity={quantity}
        className="h-12 flex-1 rounded-lg bg-primary text-xs font-black uppercase tracking-widest text-black shadow-md transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 sm:h-14 sm:text-sm"
        disabled={disabled}
      />
    </div>
  );
}
