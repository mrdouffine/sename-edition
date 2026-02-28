"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/client";
import { clearCartItems } from "@/lib/cart/client";

function CommandeSuccesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Votre commande est créée avec succès et reste en attente de paiement.");

  useEffect(() => {
    async function finalizePayment() {
      const sessionId = searchParams.get("session_id");
      const orderId = searchParams.get("orderId");
      const provider = searchParams.get("provider");
      const paid = searchParams.get("paid");
      const dashboardUrl = "/mon-compte?section=orders";

      // 1. Generic Success for non-Stripe providers that marked themselves as paid
      if (paid === "1" || provider === "paypal" || provider === "fedapay") {
        clearCartItems();
        // If we have a message or need to wait, we can stay on page, but usually we redirect to dashboard
        setTimeout(() => router.replace(dashboardUrl), 3000);
        return;
      }

      // 2. Stripe Specific Logic
      if (provider === "stripe") {
        if (!orderId) return;

        if (!sessionId) {
          router.replace(`/commande/annulee?provider=stripe&orderId=${encodeURIComponent(orderId)}`);
          return;
        }

        const response = await fetchWithAuth("/api/payments/stripe/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, sessionId })
        });

        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          const errorMessage = (payload.error ?? "").toLowerCase();
          if (errorMessage.includes("not complete") || errorMessage.includes("not completed")) {
            const reason = encodeURIComponent("Paiement échoué. Merci de réessayer.");
            router.replace(`/commande/echec?reason=${reason}&orderId=${encodeURIComponent(orderId)}`);
            return;
          }
          const reason = encodeURIComponent(payload.error ?? "Échec de validation Stripe.");
          router.replace(`/commande/echec?reason=${reason}&orderId=${encodeURIComponent(orderId)}`);
          return;
        }

        clearCartItems();
        router.replace(dashboardUrl);
      }
    }

    void finalizePayment();
  }, [router, searchParams]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">SENAME EDITION’S</p>
      <h1 className="text-2xl font-black text-[#181810] sm:text-4xl">Commande enregistrée</h1>
      <p className="mt-3 text-sm text-[#6b6959] sm:text-base">{message}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/mes-achats" className="rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase">
          Voir mes achats
        </Link>
        <Link href="/" className="rounded-lg border border-[#d8d7d0] px-5 py-3 text-sm font-bold uppercase">
          Retour boutique
        </Link>
      </div>
    </main>
  );
}

export default function CommandeSuccesPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
        <p className="text-sm font-semibold text-[#6b6959]">Finalisation de la commande...</p>
      </main>
    }>
      <CommandeSuccesContent />
    </Suspense>
  );
}
