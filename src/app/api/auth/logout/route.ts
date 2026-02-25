import { jsonSuccess } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export async function POST() {
  const response = jsonSuccess({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}
