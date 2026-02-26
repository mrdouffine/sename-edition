"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/client";

function PaypalContributionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function finalizePaypalContribution() {
      const contributionId = searchParams.get("contributionId");
      const token = searchParams.get("token");
      if (!contributionId || !token) {
        const reason = encodeURIComponent("Paramètres PayPal manquants.");
        router.replace(`/commande/echec?reason=${reason}`);
        return;
      }

      const response = await fetchWithAuth("/api/payments/contributions/paypal/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contributionId, paypalOrderId: token })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const message = (payload.error ?? "").toLowerCase();
        if (message.includes("not complete") || message.includes("not completed")) {
          const reason = encodeURIComponent("Paiement échoué. Merci de réessayer.");
          router.replace(`/commande/echec?reason=${reason}&contributionId=${encodeURIComponent(contributionId)}`);
          return;
        }
        const reason = encodeURIComponent(payload.error ?? "Échec de validation PayPal.");
        router.replace(`/commande/echec?reason=${reason}&contributionId=${encodeURIComponent(contributionId)}`);
        return;
      }

      router.replace("/mon-compte?section=contributions");
    }

    void finalizePaypalContribution();
  }, [router, searchParams]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">SENAME EDITION’S</p>
      <h1 className="text-2xl font-black text-[#181810] sm:text-4xl">Validation PayPal...</h1>
      <p className="mt-3 text-sm text-[#6b6959] sm:text-base">Merci de patienter pendant la confirmation du paiement.</p>
    </main>
  );
}

export default function PaypalContributionSuccessPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
        <p className="text-sm font-semibold text-[#6b6959]">Validation PayPal...</p>
      </main>
    }>
      <PaypalContributionSuccessContent />
    </Suspense>
  );
}

