import { NextRequest, NextResponse } from "next/server";
import { AFFILIATE_COOKIE_NAME, AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { normalizeNextPath } from "@/lib/auth/redirect";

type SessionPayload = {
  sub: string;
  email: string;
  role: "client" | "admin";
  name: string;
  iat: number;
  exp: number;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? process.env.JWT_SECRET ?? "dev-only-insecure-secret";
}

function base64UrlToUint8Array(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function decodePayload(payload: string): SessionPayload | null {
  try {
    const decoded = new TextDecoder().decode(base64UrlToUint8Array(payload));
    return JSON.parse(decoded) as SessionPayload;
  } catch {
    return null;
  }
}

async function verifyToken(token: string) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    return null;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToUint8Array(signature),
    new TextEncoder().encode(`${header}.${payload}`)
  );

  if (!isValid) {
    return null;
  }

  const session = decodePayload(payload);
  if (!session) {
    return null;
  }

  if (session.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return session;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const affiliateRef = request.nextUrl.searchParams.get("ref");
  const PROTECTED_PATHS = [
    "/mon-compte",
    "/mes-achats",
    "/mes-contributions",
    "/ma-wishlist",
    "/wishlist",
    "/panier",
    "/commande"
  ];

  const withAffiliateCookie = (response: NextResponse) => {
    if (!affiliateRef) {
      return response;
    }

    response.cookies.set(AFFILIATE_COOKIE_NAME, affiliateRef, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax"
    });
    return response;
  };

  const redirectToLogin = () => {
    const nextPath = normalizeNextPath(`${pathname}${request.nextUrl.search}`);
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("next", nextPath);
    return withAffiliateCookie(NextResponse.redirect(loginUrl));
  };

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  const requiresAuth = PROTECTED_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (requiresAuth && !pathname.startsWith("/admin")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return redirectToLogin();
    }

    const session = await verifyToken(token);
    if (!session) {
      return redirectToLogin();
    }
  }

  if (!pathname.startsWith("/admin")) {
    return withAffiliateCookie(NextResponse.next());
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return redirectToLogin();
  }

  const session = await verifyToken(token);
  if (!session) {
    return redirectToLogin();
  }

  if (session.role !== "admin") {
    return withAffiliateCookie(NextResponse.redirect(new URL("/", request.url)));
  }

  return withAffiliateCookie(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
