"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/client";

export default function FedapayPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const orderId = searchParams.get("orderId");
      if (!orderId) {
        setError("Commande introuvable.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetchWithAuth("/api/payments/fedapay/create-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId })
        });
        const payload = (await response.json()) as {
          data?: { paymentUrl?: string; successUrl?: string };
          error?: string;
        };
        if (!response.ok || !payload.data?.paymentUrl) {
          const reason = encodeURIComponent(payload.error ?? "Échec d'initialisation du paiement.");
          router.replace(`/commande/echec?reason=${reason}&orderId=${encodeURIComponent(orderId)}`);
          return;
        }
        window.location.href = payload.data.paymentUrl;
      } catch (err) {
        const reason = encodeURIComponent("Erreur réseau pendant l'initialisation du paiement.");
        router.replace(`/commande/echec?reason=${reason}&orderId=${encodeURIComponent(orderId)}`);
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, [router, searchParams]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">SENAME EDITION’S</p>
      <h1 className="mb-2 text-2xl font-black text-[#181810] sm:text-3xl">Paiement par Carte</h1>
      <p className="mb-6 text-sm text-[#6b6959]">Redirection vers la page de paiement sécurisée...</p>
      <div className="mb-6">
        <Link
          href="/panier"
          className="inline-flex rounded-lg border border-[#d8d7d0] px-4 py-2 text-sm font-bold uppercase"
        >
          Annuler et revenir au panier
        </Link>
      </div>
      {loading ? <p className="text-sm text-[#6b6959]">Chargement du paiement...</p> : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}
    </main>
  );
}
