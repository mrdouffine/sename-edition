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
    <div className="flex flex-col gap-6 sm:mb-8 sm:flex-row sm:items-center">
      <div className="flex h-12 w-20 items-center justify-center border-b border-[#e5e5e0] sm:h-14">
        <button
          type="button"
          onClick={decrement}
          className="px-2 text-gray-400 hover:text-black"
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-bold text-black sm:text-base">
          {quantity}
        </span>
        <button
          type="button"
          onClick={increment}
          className="px-2 text-gray-400 hover:text-black"
        >
          +
        </button>
      </div>
      <AddToCartButton
        book={book}
        quantity={quantity}
        className="h-12 flex-1 max-w-[280px] bg-[#EE7455] text-xs font-bold tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:h-14 sm:text-[0.65rem] uppercase"
        disabled={disabled}
      />
    </div>
  );
}
