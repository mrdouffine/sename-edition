import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { bootstrapAdminByEmail } from "@/lib/services/adminService";
import { parseBootstrapAdminPayload } from "@/lib/validation/admin";

export async function POST(request: Request) {
  try {
    const payload = parseBootstrapAdminPayload(await readJson(request));
    const user = await bootstrapAdminByEmail(payload);
    return jsonSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
