"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clearAuthToken } from "@/lib/auth/client";
import { fetchWithAuth } from "@/lib/api/client";

type EmbeddedCheckoutHandle = {
  mount(selector: string): void;
  unmount?(): void;
  destroy?(): void;
};

type StripeInstance = {
  initEmbeddedCheckout(options: {
    fetchClientSecret: () => Promise<string>;
  }): Promise<EmbeddedCheckoutHandle>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

let embeddedCheckoutPromise: Promise<EmbeddedCheckoutHandle> | null = null;

function loadStripeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }
    const existing = document.querySelector("script[data-stripe-js='1']") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Stripe script load failed")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.dataset.stripeJs = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Stripe script load failed"));
    document.head.appendChild(script);
  });
}

export default function StripePaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const checkoutRef = useRef<EmbeddedCheckoutHandle | null>(null);

  useEffect(() => {
    let disposed = false;
    async function init() {
      try {
        if (!orderId) {
          setError("orderId manquant.");
          setLoading(false);
          return;
        }

        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          setError("Configuration Stripe incomplète.");
          setLoading(false);
          return;
        }

        await loadStripeScript();
        if (!window.Stripe) {
          throw new Error("Stripe indisponible");
        }

        const stripe = window.Stripe(publishableKey);
        if (!embeddedCheckoutPromise) {
          embeddedCheckoutPromise = stripe
            .initEmbeddedCheckout({
              fetchClientSecret: async () => {
                const response = await fetchWithAuth("/api/payments/stripe/embedded-session", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId })
                });
                const payload = (await response.json()) as {
                  data?: { clientSecret?: string };
                  error?: string;
                };
                if (!response.ok || !payload.data?.clientSecret) {
                  if (response.status === 401) {
                    clearAuthToken();
                    router.push("/connexion?next=%2Fpanier&from=cart");
                    throw new Error("Unauthorized");
                  }
                  throw new Error(payload.error ?? "Impossible d'initialiser Stripe");
                }
                return payload.data.clientSecret;
              }
            })
            .finally(() => {
              embeddedCheckoutPromise = null;
            });
        }
        const checkout = await embeddedCheckoutPromise;

        if (disposed) {
          return;
        }

        checkoutRef.current?.unmount?.();
        checkoutRef.current?.destroy?.();
        checkout.mount("#stripe-embedded-checkout");
        checkoutRef.current = checkout;
        setLoading(false);
      } catch (err) {
        setLoading(false);
        const rawMessage = err instanceof Error ? err.message : "Erreur Stripe.";
        if (rawMessage.includes("multiple Embedded Checkout objects")) {
          setError("Session de paiement déjà ouverte. Rechargez la page et réessayez.");
        } else {
          setError(rawMessage);
        }
      }
    }

    void init();
    return () => {
      disposed = true;
      checkoutRef.current?.unmount?.();
      checkoutRef.current?.destroy?.();
      checkoutRef.current = null;
    };
  }, [orderId, router]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">SENAME EDITION’S</p>
      <h1 className="mb-2 text-2xl font-black text-[#181810] sm:text-3xl">Paiement Stripe</h1>
      <p className="mb-6 text-sm text-[#6b6959]">Validez votre commande via Stripe Embedded Checkout.</p>
      <div className="mb-6">
        <Link
          href={`/commande/annulee?provider=stripe&orderId=${encodeURIComponent(orderId)}`}
          className="inline-flex rounded-lg border border-[#d8d7d0] px-4 py-2 text-sm font-bold uppercase"
        >
          Annuler et retourner au panier
        </Link>
      </div>

      {loading ? <p className="text-sm text-[#6b6959]">Chargement du paiement...</p> : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <Link href="/panier" className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 font-bold uppercase">
            Retour panier
          </Link>
        </div>
      ) : null}

      <div id="stripe-embedded-checkout" />
    </main>
  );
}
