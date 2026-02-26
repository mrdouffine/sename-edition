"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/client";
import { clearCartItems } from "@/lib/cart/client";

function PaypalSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function finalizePaypalPayment() {
      const orderId = searchParams.get("orderId");
      const token = searchParams.get("token");
      if (!orderId || !token) {
        const reason = encodeURIComponent("Paramètres PayPal manquants.");
        router.replace(`/commande/echec?reason=${reason}`);
        return;
      }

      const response = await fetchWithAuth("/api/payments/paypal/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paypalOrderId: token })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        const message = (payload.error ?? "").toLowerCase();
        if (message.includes("not complete") || message.includes("not completed")) {
          const reason = encodeURIComponent("Paiement échoué. Merci de réessayer.");
          router.replace(`/commande/echec?reason=${reason}&orderId=${encodeURIComponent(orderId)}`);
          return;
        }
        const reason = encodeURIComponent(payload.error ?? "Échec de validation PayPal.");
        router.replace(`/commande/echec?reason=${reason}&orderId=${encodeURIComponent(orderId)}`);
        return;
      }

      clearCartItems();
      router.replace("/commande/succes?provider=paypal&paid=1");
    }

    void finalizePaypalPayment();
  }, [router, searchParams]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">SENAME EDITION’S</p>
      <h1 className="text-2xl font-black text-[#181810] sm:text-4xl">Validation PayPal...</h1>
      <p className="mt-3 text-sm text-[#6b6959] sm:text-base">Merci de patienter pendant la confirmation du paiement.</p>
    </main>
  );
}

export default function PaypalSuccessPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
        <p className="text-sm font-semibold text-[#6b6959]">Validation PayPal...</p>
      </main>
    }>
      <PaypalSuccessContent />
    </Suspense>
  );
}
