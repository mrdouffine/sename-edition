import { ApiError } from "@/lib/api";
import { asObject, asPassword } from "@/lib/validation/common";

export function parsePasswordChangePayload(input: unknown) {
  const body = asObject(input);

  const currentPassword = asPassword(body.currentPassword, "currentPassword");
  const nextPassword = asPassword(body.nextPassword, "nextPassword");
  const confirmPassword = asPassword(body.confirmPassword, "confirmPassword");

  if (nextPassword !== confirmPassword) {
    throw new ApiError("Les mots de passe ne correspondent pas", 400);
  }

  return {
    currentPassword,
    nextPassword
  };
}
