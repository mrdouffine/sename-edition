import { ApiError, handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { getUserById } from "@/lib/services/userService";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const user = await getUserById(session.sub);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return jsonSuccess({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
