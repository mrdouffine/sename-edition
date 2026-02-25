import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { changeUserPassword } from "@/lib/services/userService";
import { parsePasswordChangePayload } from "@/lib/validation/passwordChange";

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    const payload = parsePasswordChangePayload(await request.json());

    await changeUserPassword({
      userId: session.sub,
      currentPassword: payload.currentPassword,
      nextPassword: payload.nextPassword
    });

    return jsonSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
