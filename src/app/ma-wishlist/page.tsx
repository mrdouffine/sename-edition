"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuthToken } from "@/lib/auth/client";
import { fetchWithAuth } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

type WishlistBook = {
  id: string;
  title?: string;
  slug?: string;
  coverImage?: string;
  price?: number;
  saleType?: string;
  authorName?: string;
};

type ApiResult<T> = { data?: T; error?: string };

export default function WishlistPage() {
  const isAuthorized = useRequireAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [books, setBooks] = useState<WishlistBook[]>([]);

  async function loadWishlist() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth("/api/me/wishlist");
      const payload = (await response.json()) as ApiResult<WishlistBook[]>;

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthToken();
        }
        setError(payload.error ?? "Impossible de charger la liste d'envies");
        return;
      }

      setBooks(payload.data ?? []);
    } catch {
      setError("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadWishlist();
  }, []);

  if (!isAuthorized) {
    return null;
  }

  async function removeBook(bookId: string) {
    setMessage(null);
    const response = await fetchWithAuth("/api/me/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId })
    });

    const payload = (await response.json()) as ApiResult<WishlistBook[]>;
    if (!response.ok) {
      setError(payload.error ?? "Suppression impossible");
      return;
    }

    setBooks(payload.data ?? []);
  }

  async function addBookToCart(bookId: string) {
    setMessage(null);
    const response = await fetchWithAuth("/api/me/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, quantity: 1 })
    });
    const payload = (await response.json()) as ApiResult<{ items: unknown[] }>;
    if (!response.ok) {
      setError(payload.error ?? "Ajout au panier impossible.");
      return;
    }
    setMessage("Ajouté au panier.");
  }

  async function addAllToCart() {
    setMessage(null);
    const response = await fetchWithAuth("/api/me/cart/wishlist", {
      method: "POST"
    });
    const payload = (await response.json()) as ApiResult<{ items: unknown[] }>;
    if (!response.ok) {
      setError(payload.error ?? "Impossible d'ajouter la wishlist au panier.");
      return;
    }
    setMessage("Tous les articles ont été ajoutés au panier.");
    window.location.href = "/panier";
  }

  async function shareList() {
    setMessage(null);
    const response = await fetchWithAuth("/api/me/wishlist/share", {
      method: "POST"
    });
    const payload = (await response.json()) as ApiResult<{ token: string }>;
    if (!response.ok || !payload.data?.token) {
      setError(payload.error ?? "Impossible de partager la liste.");
      return;
    }

    const url = `${window.location.origin}/api/wishlist/share/${payload.data.token}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setMessage("Lien de wishlist copié.");
    } catch {
      setError("Impossible de copier le lien.");
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 sm:mb-8">
        <h1 className="text-2xl font-black sm:text-3xl">Ma liste d&apos;envies</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void shareList()}
            className="rounded border border-[#d8d7d0] px-3 py-2 text-xs font-bold uppercase"
          >
            Partager la liste
          </button>
          <button
            type="button"
            onClick={() => void addAllToCart()}
            className="rounded bg-primary px-3 py-2 text-xs font-bold uppercase"
          >
            Tout ajouter au panier
          </button>
          <Link href="/mon-compte" className="text-sm font-semibold uppercase tracking-wider hover:text-primary">
            Retour compte
          </Link>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-[#6b6959]">Chargement...</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-lg border border-[#e5e5e0] bg-white p-3 text-sm text-[#6b6959]">{message}</p> : null}

      {!isLoading && !error && books.length === 0 ? (
        <div className="rounded-xl border border-[#e5e5e0] bg-white p-6">Votre liste d&apos;envies est vide.</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <article key={book.id} className="rounded-xl border border-[#e5e5e0] bg-white p-4">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title ?? "Ouvrage"} className="mb-3 h-52 w-full rounded object-cover" />
            ) : null}
            <h2 className="text-lg font-black">{book.title ?? "Ouvrage"}</h2>
            <p className="text-sm text-[#6b6959]">{book.authorName ?? "Auteur"}</p>
            <p className="mt-2 text-sm font-bold">{book.price?.toFixed(2) ?? "0.00"} €</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {book.slug ? (
                <Link href={`/ouvrages/${book.slug}`} className="rounded border border-[#d8d7d0] px-3 py-2 text-xs font-bold uppercase">
                  Voir
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void addBookToCart(book.id)}
                className="rounded border border-[#d8d7d0] px-3 py-2 text-xs font-bold uppercase"
              >
                Ajouter au panier
              </button>
              <button
                type="button"
                onClick={() => void removeBook(book.id)}
                className="rounded bg-primary px-3 py-2 text-xs font-bold uppercase"
              >
                Retirer
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
