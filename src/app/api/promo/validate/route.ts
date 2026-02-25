import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { parsePromoValidationPayload } from "@/lib/validation/marketing";
import { validatePromoCode } from "@/lib/services/marketingService";

export async function POST(request: Request) {
  try {
    const payload = parsePromoValidationPayload(await readJson(request));
    const result = await validatePromoCode(payload);
    return jsonSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
