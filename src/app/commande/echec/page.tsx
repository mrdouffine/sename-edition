"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CommandeEchecContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "La commande n'a pas pu être finalisée.";
  const orderId = searchParams.get("orderId");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8d895e]">SENAME EDITION’S</p>
      <h1 className="text-[clamp(1.8rem,3vw,2.8rem)] font-black text-[#181810]">Échec de commande</h1>
      <p className="mt-3 text-[clamp(0.9rem,1.2vw,1rem)] text-[#6b6959]">{reason}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {orderId ? (
          <Link
            href={`/commande/reessayer?orderId=${encodeURIComponent(orderId)}`}
            className="rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase"
          >
            Réessayer le paiement
          </Link>
        ) : null}
        <Link href="/panier" className="rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase">
          Retour panier
        </Link>
        <Link href="/connexion" className="rounded-lg border border-[#d8d7d0] px-5 py-3 text-sm font-bold uppercase">
          Se connecter
        </Link>
      </div>
    </main>
  );
}

export default function CommandeEchecPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
        <p className="text-sm font-semibold text-[#6b6959]">Chargement...</p>
      </main>
    }>
      <CommandeEchecContent />
    </Suspense>
  );
}
