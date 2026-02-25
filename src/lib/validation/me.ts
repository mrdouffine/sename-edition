import { asObject, asOptionalEmail, asOptionalString } from "@/lib/validation/common";

export function parseUpdateProfilePayload(input: unknown) {
  const body = asObject(input);

  return {
    name: asOptionalString(body.name, "name", 120),
    email: asOptionalEmail(body.email, "email")
  };
}
