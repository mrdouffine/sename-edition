"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartCount, getCartItems } from "@/lib/cart/client";
import { getSessionFromToken } from "@/lib/auth/client";

export default function CartNavButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      setCount(getCartItems().length);
    };
    sync();

    const timer = window.setInterval(sync, 700);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Link
      href="/panier"
      className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f4f0] text-[#181810] transition-colors hover:bg-primary"
      aria-label="Panier"
    >
      <span className="material-symbols-outlined">shopping_bag</span>
      <span className="absolute -right-1 -top-1 rounded-full border-2 border-white bg-primary px-1.5 py-0.5 text-[10px] font-bold text-black">
        {count}
      </span>
    </Link>
  );
}
