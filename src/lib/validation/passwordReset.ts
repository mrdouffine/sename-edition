import { asEmail, asObject, asPassword, asString } from "@/lib/validation/common";

export function parseForgotPasswordPayload(input: unknown) {
  const body = asObject(input);

  return {
    email: asEmail(body.email)
  };
}

export function parseResetPasswordPayload(input: unknown) {
  const body = asObject(input);

  return {
    token: asString(body.token, "token", { min: 20, max: 300 }),
    password: asPassword(body.password)
  };
}
