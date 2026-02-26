"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/client";

function CommandeAnnuleeContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [notice, setNotice] = useState("Annulation en cours...");

  useEffect(() => {
    async function cancelCurrentOrder() {
      try {
        if (!orderId) {
          setNotice("Commande introuvable.");
          return;
        }

        const response = await fetchWithAuth("/api/orders/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId })
        });
        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          setNotice(payload.error ?? "Impossible d'annuler la commande.");
          return;
        }

        setNotice("Paiement annulé. Votre commande a été annulée.");
      } catch {
        setNotice("Erreur réseau pendant l'annulation de la commande.");
      }
    }

    void cancelCurrentOrder();
  }, [orderId]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">SENAME EDITION’S</p>
      <h1 className="text-[clamp(1.8rem,3vw,2.8rem)] font-black text-[#181810]">Paiement annulé</h1>
      <p className="mt-3 text-[clamp(0.9rem,1.2vw,1rem)] text-[#6b6959]">{notice}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/panier" className="rounded-lg border border-[#d8d7d0] px-5 py-3 text-sm font-bold uppercase">
          Retour panier
        </Link>
      </div>
    </main>
  );
}

export default function CommandeAnnuleePage() {
  return (
    <Suspense fallback={
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
        <p className="text-sm font-semibold text-[#6b6959]">Chargement...</p>
      </main>
    }>
      <CommandeAnnuleeContent />
    </Suspense>
  );
}
