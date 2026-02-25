"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuthToken } from "@/lib/auth/client";
import { fetchWithAuth } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

type OrderItem = {
  quantity: number;
  unitPrice: number;
  book: {
    id: string;
    title?: string;
    slug?: string;
    coverImage?: string;
  } | null;
};

type MyOrder = {
  id: string;
  total: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  saleType: "direct" | "preorder";
  paymentMethod: "stripe" | "paypal" | "mobile_money";
  invoiceNumber: string;
  items: OrderItem[];
};

type ApiResult<T> = { data?: T; error?: string };

const statusLabel: Record<MyOrder["status"], string> = {
  pending: "En attente",
  paid: "Payée",
  cancelled: "Annulée",
  refunded: "Remboursée"
};

const saleTypeLabel: Record<MyOrder["saleType"], string> = {
  direct: "Achat direct",
  preorder: "Précommande"
};

export default function MesAchatsPage() {
  const isAuthorized = useRequireAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceDialogMessage, setInvoiceDialogMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<MyOrder[]>([]);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchWithAuth("/api/me/orders");
        const payload = (await response.json()) as ApiResult<MyOrder[]>;

        if (!response.ok) {
          if (response.status === 401) {
            clearAuthToken();
          }
          setError(payload.error ?? "Impossible de charger les achats");
          return;
        }

        setOrders(payload.data ?? []);
      } catch {
        setError("Erreur réseau");
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrders();
  }, []);

  if (!isAuthorized) {
    return null;
  }

  function canAccessInvoice(status: MyOrder["status"]) {
    return status === "paid" || status === "refunded";
  }

  function handleInvoiceView(order: MyOrder) {
    if (!canAccessInvoice(order.status)) {
      setInvoiceDialogMessage("La facture est générée uniquement après un paiement effectué avec succès.");
      return;
    }
    window.open(`/factures/${order.id}`, "_blank", "noopener,noreferrer");
  }

  function handleInvoiceDownload(order: MyOrder) {
    if (!canAccessInvoice(order.status)) {
      setInvoiceDialogMessage("La facture est générée uniquement après un paiement effectué avec succès.");
      return;
    }
    window.open(`/api/orders/${order.id}/invoice?disposition=attachment`, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 sm:mb-8">
        <h1 className="text-2xl font-black sm:text-3xl">Mes achats</h1>
        <Link href="/mon-compte" className="text-sm font-semibold uppercase tracking-wider hover:text-primary">
          Retour compte
        </Link>
      </div>

      {isLoading ? <p className="text-sm text-[#6b6959]">Chargement...</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {!isLoading && !error && orders.length === 0 ? (
        <div className="rounded-xl border border-[#e5e5e0] bg-white p-6">Aucun achat pour le moment.</div>
      ) : null}

      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-[#e5e5e0] bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#ece9dc] pb-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">Commande #{order.id.slice(-6)}</p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase">
                <span className="rounded-full bg-[#f5f4f0] px-3 py-1">{saleTypeLabel[order.saleType]}</span>
                <span className="rounded-full bg-primary/30 px-3 py-1">{statusLabel[order.status]}</span>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    {item.book?.slug ? (
                      <Link href={`/ouvrages/${item.book.slug}`} className="font-semibold underline decoration-primary">
                        {item.book?.title ?? "Ouvrage"}
                      </Link>
                    ) : (
                      <p className="font-semibold">{item.book?.title ?? "Ouvrage"}</p>
                    )}
                    <p className="text-[#6b6959]">
                      Quantité: {item.quantity} • Prix unitaire: {item.unitPrice.toFixed(2)} €
                    </p>
                  </div>
                  <p className="font-bold">{(item.unitPrice * item.quantity).toFixed(2)} €</p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#ece9dc] pt-4 text-right">
              <p className="text-xs text-[#8d895e]">Facture: {order.invoiceNumber}</p>
              <p className="text-sm text-[#6b6959]">Total</p>
              <p className="text-xl font-black">{order.total.toFixed(2)} €</p>
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleInvoiceView(order)}
                  className="inline-block rounded border border-[#d8d7d0] px-3 py-1 text-xs font-bold uppercase tracking-wider"
                >
                  Voir facture PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleInvoiceDownload(order)}
                  className="inline-block rounded border border-[#d8d7d0] px-3 py-1 text-xs font-bold uppercase tracking-wider"
                >
                  Télécharger facture PDF
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {invoiceDialogMessage ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black text-[#181810]">Facture indisponible</h3>
            <p className="mt-2 text-sm text-[#6b6959]">{invoiceDialogMessage}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setInvoiceDialogMessage(null)}
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
