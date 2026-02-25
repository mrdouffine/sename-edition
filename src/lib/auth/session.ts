import { ApiError } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import {
  getBearerToken,
  getCookieToken,
  verifySessionToken,
  type SessionPayload
} from "@/lib/auth/crypto";

function getSessionToken(request: Request) {
  return getBearerToken(request) ?? getCookieToken(request, AUTH_COOKIE_NAME);
}

export function requireAuth(request: Request): SessionPayload {
  const token = getSessionToken(request);
  if (!token) {
    throw new ApiError("Missing authentication token", 401);
  }

  const session = verifySessionToken(token);
  if (!session) {
    throw new ApiError("Invalid or expired token", 401);
  }

  return session;
}

export function optionalAuth(request: Request): SessionPayload | null {
  const token = getSessionToken(request);
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export function requireRole(session: SessionPayload, roles: Array<SessionPayload["role"]>) {
  if (!roles.includes(session.role)) {
    throw new ApiError("Forbidden", 403);
  }
}
