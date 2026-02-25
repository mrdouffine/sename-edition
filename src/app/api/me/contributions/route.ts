import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { listMyContributions } from "@/lib/services/meService";

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const contributions = await listMyContributions(session.sub);
    return jsonSuccess(contributions);
  } catch (error) {
    return handleApiError(error);
  }
}
