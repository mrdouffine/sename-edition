import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import {
  AFFILIATE_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  getAuthTokenTtlSeconds
} from "@/lib/auth/constants";
import { getCookieToken, signSessionToken } from "@/lib/auth/crypto";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { sendSignupEmail } from "@/lib/services/emailService";
import { createUser } from "@/lib/services/userService";
import { parseSignupPayload } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "auth:signup",
      limit: 8,
      windowMs: 10 * 60 * 1000,
      message: "Trop de tentatives d'inscription. Réessayez plus tard."
    });

    const payload = parseSignupPayload(await readJson(request));
    const referredBy = getCookieToken(request, AFFILIATE_COOKIE_NAME) ?? undefined;
    const user = await createUser({
      ...payload,
      referredBy
    });
    await sendSignupEmail({ to: user.email, name: user.name });

    const token = signSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const response = jsonSuccess({ user, token }, 201);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getAuthTokenTtlSeconds()
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
