"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type ApiResult<T> = { data?: T; error?: string };

type ForgotPasswordResult = {
  success: boolean;
  token?: string;
  expiresAt?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForgotPasswordResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as ApiResult<ForgotPasswordResult>;

      if (!response.ok || !payload.data) {
        setError(payload.error ?? "Requête impossible");
        return;
      }

      setResult(payload.data);
    } catch {
      setError("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background-light px-4 py-10 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e5e0] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 justify-center">
            <div className="flex size-8 items-center justify-center rounded-full bg-black text-primary">
              <span className="material-symbols-outlined text-xl">menu_book</span>
            </div>
            <div>
              <h1 className="text-base font-extrabold uppercase leading-tight tracking-tight text-[#181810] sm:text-lg">
                SENAME EDITION’S
              </h1>
            </div>
          </div>
          <br />
        <h2 className="mb-2 text-[clamp(1.4rem,2.2vw,2rem)] font-black">Mot de passe oublié</h2>
        <p className="mb-6 text-[clamp(0.9rem,1.2vw,1rem)] text-[#6b6959]">Recevez un lien de réinitialisation (mode local: token affiché).</p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-lg border border-[#d8d7d0] bg-white px-4 py-3 outline-none transition focus:border-primary"
              placeholder="vous@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-3 text-xs font-black uppercase tracking-wider text-black disabled:opacity-60 sm:text-sm"
          >
            {isLoading ? "Envoi..." : "Envoyer"}
          </button>
        </form>

        {result ? (
          <div className="mt-5 rounded-lg border border-[#e5e5e0] bg-[#f8f8f5] p-3 text-sm">
            <p className="font-semibold">Demande enregistrée.</p>
            {result.token ? (
              <p className="mt-2 break-all">
                Token de test: <span className="font-bold">{result.token}</span>
              </p>
            ) : null}
            {result.token ? (
              <Link href={`/reinitialiser-mot-de-passe?token=${result.token}`} className="mt-3 inline-block font-bold underline">
                Ouvrir la page de réinitialisation
              </Link>
            ) : null}
          </div>
        ) : null}

        <p className="mt-6 text-sm text-[#6b6959]">
          Retour à la{" "}
          <Link className="font-bold underline decoration-primary" href="/connexion">
            connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
