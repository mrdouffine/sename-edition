"use client";

import { FormEvent, useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Inscription newsletter impossible");
        return;
      }
      setMessage("Inscription newsletter confirmée.");
      setEmail("");
    } catch {
      setMessage("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]">
        Newsletter
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="vous@example.com"
          className="w-full rounded border border-[#181810] bg-white px-3 py-2 text-sm"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded border border-[#181810] bg-[#181810] px-3 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60"
        >
          {loading ? "..." : "S'inscrire"}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs">{message}</p> : null}
    </form>
  );
}
