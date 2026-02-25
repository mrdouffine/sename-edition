"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { saveAuthToken } from "@/lib/auth/client";
import { normalizeNextPath } from "@/lib/auth/redirect";

type LoginResponse = {
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: "client" | "admin";
    };
    token: string;
  };
  error?: string;
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const nextPath = normalizeNextPath(searchParams.get("next"), "/");
  const from = searchParams.get("from");
  const signupHref = `/inscription?next=${encodeURIComponent(nextPath)}${from ? `&from=${encodeURIComponent(from)}` : ""
    }`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validation côté client
    const errors: { email?: string; password?: string } = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errors.email = "Veuillez saisir une adresse email valide";
    }
    if (!password || password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const payload = (await response.json()) as LoginResponse;

      if (!response.ok || !payload.data?.token) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      saveAuthToken(payload.data.token, payload.data.user.role === "admin" ? "session" : "local");
      window.location.replace(payload.data.user.role === "admin" ? "/admin" : nextPath);
      return;
    } catch {
      setError("Une erreur réseau est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background-light px-4 py-10 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e5e0] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
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
          <h2 className="text-[clamp(1.6rem,2.6vw,2.2rem)] font-black text-[#181810]">Connexion</h2>
          <p className="mt-2 text-[clamp(0.9rem,1.2vw,1rem)] text-[#6b6959]">Accédez à votre compte client.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className={`w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:border-primary ${fieldErrors.email ? 'border-red-400' : 'border-[#d8d7d0]'}`}
              placeholder="vous@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              className={`w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:border-primary ${fieldErrors.password ? 'border-red-400' : 'border-[#d8d7d0]'}`}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <Link
          href="/mot-de-passe-oublie"
          className="mt-4 inline-block text-sm font-semibold text-[#181810] underline decoration-primary"
        >
          Mot de passe oublié ?
        </Link>

        <p className="mt-6 text-sm text-[#6b6959]">
          Pas de compte ?{" "}
          <Link className="font-bold text-[#181810] underline decoration-primary" href={signupHref}>
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
