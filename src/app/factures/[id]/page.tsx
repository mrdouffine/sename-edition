"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { fetchWithAuth } from "@/lib/api/client";
import { clearAuthToken } from "@/lib/auth/client";

type MyOrder = {
  id: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
};

type ApiResult<T> = {
  data?: T;
  error?: string;
};

export default function InvoicePreviewPage() {
  const isAuthorized = useRequireAuth();
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canAccess, setCanAccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      if (!orderId) {
        setError("Facture introuvable.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetchWithAuth("/api/me/orders");
        const payload = (await response.json()) as ApiResult<MyOrder[]>;
        if (!response.ok) {
          if (response.status === 401) {
            clearAuthToken();
          }
          setError(payload.error ?? "Impossible de vérifier la facture.");
          setLoading(false);
          return;
        }

        const current = (payload.data ?? []).find((item) => item.id === orderId);
        if (!current) {
          setError("Commande introuvable.");
          setLoading(false);
          return;
        }

        const allowed = current.status === "paid" || current.status === "refunded";
        setCanAccess(allowed);
        setDialogOpen(!allowed);
        setLoading(false);
      } catch {
        setError("Erreur réseau.");
        setLoading(false);
      }
    }

    if (isAuthorized) {
      void checkAccess();
    }
  }, [isAuthorized, orderId]);

  if (!isAuthorized) {
    return null;
  }

  if (!orderId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
        <p className="text-sm text-[#6b6959]">Facture introuvable.</p>
        <Link href="/mon-compte?section=orders" className="mt-4 rounded border border-[#d8d7d0] px-4 py-2 text-xs font-bold uppercase">
          Retour commandes
        </Link>
      </main>
      );
  }

  const inlineSrc = `/api/orders/${encodeURIComponent(orderId)}/invoice?disposition=inline#toolbar=0&navpanes=0&scrollbar=1`;
  const downloadSrc = `/api/orders/${encodeURIComponent(orderId)}/invoice?disposition=attachment`;

  return (
    <main className="min-h-screen bg-[#efefed] px-3 py-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Link href="/mon-compte?section=orders" className="rounded border border-[#d8d7d0] bg-white px-3 py-2 text-xs font-bold uppercase">
            Retour commandes
          </Link>
          <a
            href={downloadSrc}
            className={`rounded px-4 py-2 text-xs font-bold uppercase text-[#181810] ${canAccess ? "bg-primary" : "pointer-events-none cursor-not-allowed bg-[#e6e6e3] text-[#8b8b84]"}`}
          >
            Télécharger la facture
          </a>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#dcdcdc] bg-white">
          {loading ? (
            <div className="flex h-[72vh] items-center justify-center text-sm text-[#6b6959] sm:h-[78vh] md:h-[85vh]">Chargement...</div>
          ) : error ? (
            <div className="flex h-[72vh] items-center justify-center px-6 text-sm text-red-700 sm:h-[78vh] md:h-[85vh]">{error}</div>
          ) : canAccess ? (
            <iframe
              title="Aperçu facture PDF"
              src={inlineSrc}
              className="h-[72vh] w-full sm:h-[78vh] md:h-[85vh]"
            />
          ) : (
            <div className="flex h-[72vh] items-center justify-center px-6 text-sm text-[#6b6959] sm:h-[78vh] md:h-[85vh]">
              Facture indisponible tant que le paiement n&apos;est pas validé.
            </div>
          )}
        </div>
      </div>
      {dialogOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black text-[#181810]">Facture indisponible</h3>
            <p className="mt-2 text-sm text-[#6b6959]">
              La facture est générée uniquement après un paiement effectué avec succès.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded bg-primary px-4 py-2 text-xs font-bold uppercase text-[#181810]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
