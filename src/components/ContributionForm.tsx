"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/api/client";
import { getSessionFromToken } from "@/lib/auth/client";
import { usePathname, useSearchParams } from "next/navigation";

type ApiResult<T> = { data?: T; error?: string };

export default function ContributionForm({ bookId }: { bookId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState("25");
  const [reward, setReward] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false);
  const session = getSessionFromToken();
  const role = session?.role ?? null;
  const shouldOpenAfterLogin = searchParams.get("contribute") === "1";

  const loginNextPath = useMemo(() => {
    if (!pathname) return "/";
    const params = new URLSearchParams(searchParams.toString());
    params.set("contribute", "1");
    const suffix = params.toString();
    return suffix ? `${pathname}?${suffix}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!shouldOpenAfterLogin) return;
    if (!session) return;
    if (role === "client") {
      setIsMethodDialogOpen(true);
      return;
    }
    if (role === "admin") {
      setMessage("Les administrateurs ne peuvent pas contribuer.");
    }
  }, [role, session, shouldOpenAfterLogin]);

  function openContributionDialog() {
    setMessage(null);
    if (!session) {
      window.location.replace(`/connexion?next=${encodeURIComponent(loginNextPath)}&from=contribution`);
      return;
    }
    if (role === "admin") {
      setMessage("Les administrateurs ne peuvent pas contribuer.");
      return;
    }
    setIsMethodDialogOpen(true);
  }

  async function submit(paymentMethod: "stripe" | "paypal") {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetchWithAuth("/api/payments/contributions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          amount: Number(amount),
          reward: reward || undefined,
          paymentMethod
        })
      });

      const payload = (await response.json()) as ApiResult<{ redirectUrl?: string }>;
      if (!response.ok) {
        if (response.status === 401) {
          window.location.replace(`/connexion?next=${encodeURIComponent(loginNextPath)}&from=contribution`);
          return;
        }
        setMessage(payload.error ?? "Contribution impossible");
        return;
      }

      const redirectUrl = payload.data?.redirectUrl;
      if (!redirectUrl) {
        setMessage("Impossible d'initialiser le paiement.");
        return;
      }

      if (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://")) {
        window.location.href = redirectUrl;
        return;
      }

      window.location.href = redirectUrl;
    } finally {
      setIsMethodDialogOpen(false);
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-[#e5e5e0] bg-white p-4">
      <h4 className="mb-2 text-lg font-bold">Participer au financement</h4>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          type="number"
          min={1}
          className="rounded border border-[#d8d7d0] px-3 py-2"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Montant (€)"
        />
        <input
          className="rounded border border-[#d8d7d0] px-3 py-2"
          value={reward}
          onChange={(event) => setReward(event.target.value)}
          placeholder="Récompense (optionnel)"
        />
      </div>
      <button
        onClick={openContributionDialog}
        disabled={loading}
        className="mt-3 rounded bg-primary px-4 py-2 text-sm font-bold uppercase disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Contribuer"}
      </button>
      {message ? <p className="mt-2 text-sm text-[#6b6959]">{message}</p> : null}

      {isMethodDialogOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black text-[#181810]">Choisir un mode de financement</h3>
            <p className="mt-2 text-sm text-[#6b6959]">
              Sélectionnez le mode de paiement pour votre contribution.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void submit("stripe")}
                disabled={loading}
                className="rounded-lg border border-[#d8d7d0] px-4 py-3 text-sm font-bold uppercase hover:bg-[#f8f8f5] disabled:opacity-60"
              >
                Stripe
              </button>
              <button
                type="button"
                onClick={() => void submit("paypal")}
                disabled={loading}
                className="rounded-lg border border-[#d8d7d0] px-4 py-3 text-sm font-bold uppercase hover:bg-[#f8f8f5] disabled:opacity-60"
              >
                PayPal
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMethodDialogOpen(false)}
                disabled={loading}
                className="rounded bg-primary px-4 py-2 text-xs font-bold uppercase text-[#181810] disabled:opacity-60"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
