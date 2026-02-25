import { asEmail, asObject, asPassword, asString } from "@/lib/validation/common";

export function parseSignupPayload(input: unknown) {
  const body = asObject(input);

  return {
    name: asString(body.name, "name", { min: 2, max: 120 }),
    email: asEmail(body.email),
    password: asPassword(body.password)
  };
}

export function parseLoginPayload(input: unknown) {
  const body = asObject(input);

  return {
    email: asEmail(body.email),
    password: asPassword(body.password)
  };
}
