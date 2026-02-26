"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";

type ApiResult<T> = { data?: T; error?: string };

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromQuery = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setToken(tokenFromQuery);
  }, [tokenFromQuery]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const payload = (await response.json()) as ApiResult<{ success: boolean }>;
      if (!response.ok) {
        setError(payload.error ?? "Réinitialisation impossible");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
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
        <h2 className="mb-2 text-[clamp(1.4rem,2.2vw,2rem)] font-black">Réinitialiser le mot de passe</h2>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="token">
              Token
            </label>
            <input
              id="token"
              type="text"
              required
              className="w-full rounded-lg border border-[#d8d7d0] px-4 py-3 outline-none focus:border-primary"
              placeholder="Token reçu"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="password">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-[#d8d7d0] px-4 py-3 outline-none focus:border-primary"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="confirmPassword">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-[#d8d7d0] px-4 py-3 outline-none focus:border-primary"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">Mot de passe mis à jour.</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-3 text-xs font-black uppercase tracking-wider disabled:opacity-60 sm:text-sm"
          >
            {isLoading ? "Mise à jour..." : "Réinitialiser"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#6b6959]">
          Aller à la{" "}
          <Link className="font-bold underline decoration-primary" href="/connexion">
            connexion
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <p className="text-sm font-semibold text-[#6b6959]">Chargement...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
