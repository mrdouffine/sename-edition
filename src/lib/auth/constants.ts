export const AUTH_COOKIE_NAME = "livreo_session";
export const AFFILIATE_COOKIE_NAME = "livreo_affiliate_ref";

export function getAuthTokenTtlSeconds() {
  return Number.parseInt(process.env.AUTH_TOKEN_TTL_SECONDS ?? "604800", 10);
}
