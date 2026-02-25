"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/client";

type RetryResponse = {
  data?: {
    provider: "stripe" | "paypal";
    redirectUrl: string;
  };
  error?: string;
};

export default function CommandeReessayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function retryPayment() {
      if (!orderId) {
        setError("orderId manquant.");
        return;
      }

      const response = await fetchWithAuth(`/api/orders/${encodeURIComponent(orderId)}/retry-payment`, {
        method: "POST"
      });
      const payload = (await response.json()) as RetryResponse;

      if (!response.ok || !payload.data?.redirectUrl) {
        setError(payload.error ?? "Impossible de réessayer le paiement.");
        return;
      }

      if (payload.data.redirectUrl.startsWith("http://") || payload.data.redirectUrl.startsWith("https://")) {
        window.location.href = payload.data.redirectUrl;
        return;
      }

      router.replace(payload.data.redirectUrl);
    }

    void retryPayment();
  }, [orderId, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">SENAME EDITION’S</p>
      <h1 className="text-[clamp(1.8rem,3vw,2.8rem)] font-black text-[#181810]">Réessai du paiement</h1>
      {!error ? <p className="mt-3 text-[clamp(0.9rem,1.2vw,1rem)] text-[#6b6959]">Redirection en cours...</p> : null}
      {error ? (
        <>
          <p className="mt-3 text-[clamp(0.9rem,1.2vw,1rem)] text-[#6b6959]">{error}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {orderId ? (
              <Link
                href={`/commande/annulee?orderId=${encodeURIComponent(orderId)}`}
                className="rounded-lg border border-[#d8d7d0] px-5 py-3 text-sm font-bold uppercase"
              >
                Annuler la commande
              </Link>
            ) : null}
            <Link href="/panier" className="rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase">
              Retour panier
            </Link>
          </div>
        </>
      ) : null}
    </main>
  );
}
