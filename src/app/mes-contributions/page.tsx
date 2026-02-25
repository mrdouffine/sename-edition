"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuthToken } from "@/lib/auth/client";
import { fetchWithAuth } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

type MyContribution = {
  id: string;
  amount: number;
  reward: string;
  status: "pending" | "paid" | "refunded";
  book: {
    id: string;
    title?: string;
    slug?: string;
    coverImage?: string;
  } | null;
};

type ApiResult<T> = { data?: T; error?: string };

const statusLabel: Record<MyContribution["status"], string> = {
  pending: "En attente",
  paid: "Payée",
  refunded: "Remboursée"
};

export default function MesContributionsPage() {
  const isAuthorized = useRequireAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributions, setContributions] = useState<MyContribution[]>([]);

  useEffect(() => {
    async function loadContributions() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchWithAuth("/api/me/contributions");
        const payload = (await response.json()) as ApiResult<MyContribution[]>;

        if (!response.ok) {
          if (response.status === 401) {
            clearAuthToken();
          }
          setError(payload.error ?? "Impossible de charger les contributions");
          return;
        }

        setContributions(payload.data ?? []);
      } catch {
        setError("Erreur réseau");
      } finally {
        setIsLoading(false);
      }
    }

    void loadContributions();
  }, []);

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 sm:mb-8">
        <h1 className="text-2xl font-black sm:text-3xl">Mes contributions</h1>
        <Link href="/mon-compte" className="text-sm font-semibold uppercase tracking-wider hover:text-primary">
          Retour compte
        </Link>
      </div>

      {isLoading ? <p className="text-sm text-[#6b6959]">Chargement...</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {!isLoading && !error && contributions.length === 0 ? (
        <div className="rounded-xl border border-[#e5e5e0] bg-white p-6">Aucune contribution pour le moment.</div>
      ) : null}

      <div className="space-y-4">
        {contributions.map((contribution) => (
          <article key={contribution.id} className="rounded-xl border border-[#e5e5e0] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#ece9dc] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">Contribution #{contribution.id.slice(-6)}</p>
                <p className="mt-1 text-lg font-bold">{contribution.book?.title ?? "Campagne"}</p>
              </div>
              <span className="rounded-full bg-primary/30 px-3 py-1 text-xs font-bold uppercase">{statusLabel[contribution.status]}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-[#6b6959]">Récompense: {contribution.reward}</p>
              <p className="text-xl font-black">{contribution.amount.toFixed(2)} €</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
