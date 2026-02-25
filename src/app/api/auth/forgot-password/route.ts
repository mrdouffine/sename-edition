import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { assertRateLimit } from "@/lib/security/rateLimit";
import { requestPasswordReset } from "@/lib/services/passwordResetService";
import { parseForgotPasswordPayload } from "@/lib/validation/passwordReset";

export async function POST(request: Request) {
  try {
    assertRateLimit({
      request,
      key: "auth:forgot_password",
      limit: 8,
      windowMs: 10 * 60 * 1000,
      message: "Trop de demandes de réinitialisation. Réessayez plus tard."
    });

    const payload = parseForgotPasswordPayload(await readJson(request));
    const result = await requestPasswordReset(payload.email);
    return jsonSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
