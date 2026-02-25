"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchWithAuth } from "@/lib/api/client";
import { getSessionFromToken } from "@/lib/auth/client";
import { normalizeNextPath } from "@/lib/auth/redirect";

type ApiResult<T> = { data?: T; error?: string };

export default function WishlistButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function addToWishlist() {
    const session = getSessionFromToken();
    if (!session) {
      const nextPath = normalizeNextPath("/mon-compte?section=wishlist", "/mon-compte");
      router.push(`/connexion?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    const response = await fetchWithAuth("/api/me/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId })
    });

    const payload = (await response.json()) as ApiResult<unknown>;
    if (!response.ok) {
      setMessage(payload.error ?? "Impossible d'ajouter à la liste d'envies");
      return;
    }

    setMessage("Ajouté à la liste d'envies");
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => void addToWishlist()}
        className="rounded-lg border border-[#d8d7d0] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider"
      >
        Ajouter à la liste d&apos;envies
      </button>
      {message ? <p className="mt-2 text-xs text-[#8d895e]">{message}</p> : null}
    </div>
  );
}
