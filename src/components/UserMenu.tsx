"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { clearAuthToken, getSessionFromToken } from "@/lib/auth/client";
import { normalizeNextPath } from "@/lib/auth/redirect";

type Props = {
  showAuthLinks?: boolean;
};

export default function UserMenu({ showAuthLinks = false }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [role, setRole] = useState<"client" | "admin" | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const next = encodeURIComponent(normalizeNextPath(pathname, "/"));

  useEffect(() => {
    const session = getSessionFromToken();
    setSessionName(session?.name ?? null);
    setRole(session?.role ?? null);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (event.target instanceof Node && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearAuthToken();
    setSessionName(null);
    setRole(null);
    setIsOpen(false);
    void fetch("/api/auth/logout", { method: "POST", keepalive: true });
    window.location.replace("/");
  }

  if (role === "admin" && !pathname.startsWith("/admin")) {
    if (!showAuthLinks) return null;
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

  if (!sessionName) {
    if (!showAuthLinks) return null;
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

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 items-center gap-2 rounded-lg border border-primary bg-primary/90 px-3 text-sm font-semibold text-[#181810] shadow-sm transition hover:bg-primary"
      >
        <span className="material-symbols-outlined text-base">person</span>
        <span className="hidden sm:inline">{sessionName}</span>
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-[#e5e5e0] bg-white shadow-lg">
          <div className="border-b border-[#f0efe9] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#8d895e]">
            Mon compte
          </div>
          <div className="flex flex-col">
            <Link
              href={role === "admin" ? "/admin" : "/mon-compte"}
              className="flex items-center gap-3 px-4 py-3 text-sm text-[#181810] transition hover:bg-[#f8f8f5]"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-base text-[#8d895e]">
                person
              </span>
              Mon profil
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-[#fef2f2]"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Déconnexion
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
