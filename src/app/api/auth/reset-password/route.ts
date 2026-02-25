import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { resetPasswordWithToken } from "@/lib/services/passwordResetService";
import { parseResetPasswordPayload } from "@/lib/validation/passwordReset";

export async function POST(request: Request) {
  try {
    const payload = parseResetPasswordPayload(await readJson(request));
    const result = await resetPasswordWithToken(payload.token, payload.password);
    return jsonSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
