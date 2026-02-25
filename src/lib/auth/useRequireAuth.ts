"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getSessionFromToken } from "@/lib/auth/client";
import { normalizeNextPath } from "@/lib/auth/redirect";

export function useRequireAuth() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState(false);
  const searchString = searchParams.toString();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const session = getSessionFromToken();
    if (session) {
      setAuthorized(true);
      return;
    }

    setAuthorized(false);
    const basePath = pathname ?? "/";
    const nextPath = normalizeNextPath(
      `${basePath}${searchString ? `?${searchString}` : ""}`,
      basePath
    );
    window.location.replace(`/connexion?next=${encodeURIComponent(nextPath)}`);
  }, [authorized, pathname, searchString]);

  return authorized;
}
