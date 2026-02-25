"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthToken, getSessionFromToken } from "@/lib/auth/client";
import { normalizeNextPath } from "@/lib/auth/redirect";

export default function AuthNav() {
  const pathname = usePathname();
  const [sessionRole, setSessionRole] = useState<"client" | "admin" | null>(null);
  const next = encodeURIComponent(normalizeNextPath(pathname, "/"));

  useEffect(() => {
    const session = getSessionFromToken();
    setSessionRole(session?.role ?? null);
  }, []);

  function handleLogout() {
    clearAuthToken();
    setSessionRole(null);
    void fetch("/api/auth/logout", { method: "POST", keepalive: true });
    window.location.replace("/");
  }

  if (sessionRole) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        {sessionRole === "admin" ? (
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-wider text-[#181810] transition-colors hover:text-primary sm:text-sm"
          >
            admin
          </Link>
        ) : null}
        <Link
          href="/mon-compte"
          className="text-xs font-semibold uppercase tracking-wider text-[#181810] transition-colors hover:text-primary sm:text-sm"
        >
          mon compte
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-[#d8d7d0] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#181810] transition hover:border-primary"
        >
          déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <Link
        href={`/connexion?next=${next}&from=home`}
        className="text-xs font-semibold uppercase tracking-wider text-[#181810] transition-colors hover:text-primary sm:text-sm"
      >
        connexion
      </Link>
      <Link
        href={`/inscription?next=${next}&from=home`}
        className="text-xs font-semibold uppercase tracking-wider text-[#181810] transition-colors hover:text-primary sm:text-sm"
      >
        inscription
      </Link>
    </div>
  );
}
