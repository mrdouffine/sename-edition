import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { getProfile, updateProfile } from "@/lib/services/meService";
import { parseUpdateProfilePayload } from "@/lib/validation/me";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const profile = await getProfile(session.sub);
    return jsonSuccess(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    const payload = parseUpdateProfilePayload(await readJson(request));
    const profile = await updateProfile(session.sub, payload);
    return jsonSuccess(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
