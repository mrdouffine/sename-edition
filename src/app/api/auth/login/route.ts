import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { AUTH_COOKIE_NAME, getAuthTokenTtlSeconds } from "@/lib/auth/constants";
import { signSessionToken } from "@/lib/auth/crypto";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { authenticateUser } from "@/lib/services/userService";
import { parseLoginPayload } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "auth:login",
      limit: 15,
      windowMs: 10 * 60 * 1000,
      message: "Trop de tentatives de connexion. Réessayez plus tard."
    });

    const payload = parseLoginPayload(await readJson(request));
    const user = await authenticateUser(payload);

    const token = signSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const response = jsonSuccess({ user, token });
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
