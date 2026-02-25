import { handleApiError, jsonSuccess, readJson } from "@/lib/api";
import { subscribeNewsletter } from "@/lib/services/marketingService";
import { parseNewsletterPayload } from "@/lib/validation/marketing";

export async function POST(request: Request) {
  try {
    const payload = parseNewsletterPayload(await readJson(request));
    const subscription = await subscribeNewsletter(payload);
    return jsonSuccess(subscription, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
