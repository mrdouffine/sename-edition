import { ApiError } from "@/lib/api";
import { createHmac, timingSafeEqual } from "node:crypto";

function normalizeAmountToCents(amount: number) {
  return Math.round(amount * 100);
}

export function getTrustedAppOrigin(requestUrl: string) {
  const configured =
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL;

  if (configured) {
    try {
      const parsed = new URL(configured);
      return parsed.origin;
    } catch {
      throw new ApiError("Invalid APP_BASE_URL/NEXT_PUBLIC_APP_URL", 500);
    }
  }

  const fallback = new URL(requestUrl).origin;
  if (process.env.NODE_ENV === "production" && !fallback.startsWith("https://")) {
    throw new ApiError("Invalid application origin for production", 500);
  }
  return fallback;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new ApiError(`Missing environment variable: ${name}`, 500);
  }
  return value;
}

async function stripeRequest(path: string, body?: URLSearchParams) {
  const secretKey = getRequiredEnv("STRIPE_SECRET_KEY");
  const response = await fetch(`https://api.stripe.com${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {})
    },
    body: body?.toString()
  });

  if (!response.ok) {
    throw new ApiError("Stripe provider error", 502);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

type StripeRequestOptions = {
  method?: "GET" | "POST";
  body?: URLSearchParams;
};

async function stripeRequestWithMethod(path: string, options: StripeRequestOptions = {}) {
  const secretKey = getRequiredEnv("STRIPE_SECRET_KEY");
  const method = options.method ?? (options.body ? "POST" : "GET");
  const response = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(options.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {})
    },
    body: options.body?.toString()
  });

  if (!response.ok) {
    throw new ApiError("Stripe provider error", 502);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function createStripeEmbeddedCheckoutSession(params: {
  orderId: string;
  email: string;
  successUrl: string;
  lineItems: Array<{ name: string; unitAmountCents: number; quantity: number }>;
}) {
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("ui_mode", "embedded");
  form.set("client_reference_id", params.orderId);
  form.set("customer_email", params.email);
  form.set("return_url", `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`);
  form.set("metadata[orderId]", params.orderId);

  params.lineItems.forEach((item, index) => {
    form.set(`line_items[${index}][price_data][currency]`, "eur");
    form.set(`line_items[${index}][price_data][product_data][name]`, item.name);
    form.set(`line_items[${index}][price_data][unit_amount]`, String(item.unitAmountCents));
    form.set(`line_items[${index}][quantity]`, String(item.quantity));
  });

  const totalAmountCents = params.lineItems.reduce((sum, item) => sum + item.unitAmountCents * item.quantity, 0);

  const payload = await stripeRequest("/v1/checkout/sessions", form);
  const clientSecret = payload.client_secret;
  const sessionId = payload.id;

  if (typeof clientSecret !== "string" || typeof sessionId !== "string") {
    throw new ApiError("Invalid Stripe session response", 502);
  }

  return { clientSecret, sessionId, totalAmountCents };
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  return stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

function parseStripeSignatureHeader(value: string) {
  const parts = value.split(",");
  const out: Record<string, string[]> = {};
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (!k || !v) continue;
    const key = k.trim();
    const val = v.trim();
    out[key] = [...(out[key] ?? []), val];
  }
  return out;
}

export function verifyStripeWebhookSignature(params: {
  rawBody: string;
  signatureHeader: string | null;
}) {
  const secret = getRequiredEnv("STRIPE_WEBHOOK_SECRET");
  if (!params.signatureHeader) {
    throw new ApiError("Missing Stripe signature", 400);
  }

  const parsed = parseStripeSignatureHeader(params.signatureHeader);
  const timestamp = parsed.t?.[0];
  const signatures = parsed.v1 ?? [];
  if (!timestamp || signatures.length === 0) {
    throw new ApiError("Invalid Stripe signature header", 400);
  }

  const payloadToSign = `${timestamp}.${params.rawBody}`;
  const expected = createHmac("sha256", secret).update(payloadToSign).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const match = signatures.some((sig) => {
    const provided = Buffer.from(sig, "utf8");
    return provided.length === expectedBuffer.length && timingSafeEqual(provided, expectedBuffer);
  });

  if (!match) {
    throw new ApiError("Invalid Stripe signature", 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > 300) {
    throw new ApiError("Expired Stripe signature", 400);
  }
}

export async function refundStripePayment(params: {
  paymentIntentId: string;
  amountCents?: number;
}) {
  const form = new URLSearchParams();
  form.set("payment_intent", params.paymentIntentId);
  if (typeof params.amountCents === "number") {
    form.set("amount", String(params.amountCents));
  }

  return stripeRequestWithMethod("/v1/refunds", {
    method: "POST",
    body: form
  });
}

async function getPaypalAccessToken() {
  const clientId = getRequiredEnv("PAYPAL_CLIENT_ID");
  const clientSecret = getRequiredEnv("PAYPAL_CLIENT_SECRET");
  const apiBase = process.env.PAYPAL_API_BASE_URL ?? "https://api-m.sandbox.paypal.com";
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new ApiError("PayPal provider error", 502);
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new ApiError("Invalid PayPal token response", 502);
  }

  return { token: payload.access_token, apiBase };
}

export async function createPaypalOrder(params: {
  orderId: string;
  total: number;
  successUrl: string;
  cancelUrl: string;
}) {
  if (params.total <= 0 || !Number.isFinite(params.total)) {
    throw new ApiError("Invalid order total", 400);
  }

  const { token, apiBase } = await getPaypalAccessToken();

  const response = await fetch(`${apiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.orderId,
          custom_id: params.orderId,
          amount: {
            currency_code: "EUR",
            value: params.total.toFixed(2)
          }
        }
      ],
      application_context: {
        return_url: params.successUrl,
        cancel_url: params.cancelUrl,
        user_action: "PAY_NOW"
      }
    })
  });

  if (!response.ok) {
    throw new ApiError("PayPal provider error", 502);
  }

  const payload = (await response.json()) as {
    id?: string;
    links?: Array<{ rel?: string; href?: string }>;
  };

  const approvalUrl = payload.links?.find((entry) => entry.rel === "approve")?.href;
  if (!payload.id || !approvalUrl) {
    throw new ApiError("Invalid PayPal create order response", 502);
  }

  return {
    paypalOrderId: payload.id,
    approvalUrl
  };
}

export async function capturePaypalOrder(paypalOrderId: string) {
  const { token, apiBase } = await getPaypalAccessToken();
  const response = await fetch(`${apiBase}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new ApiError("PayPal provider error", 502);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function refundPaypalCapture(params: {
  captureId: string;
  amount?: { value: string; currencyCode: string };
}) {
  const { token, apiBase } = await getPaypalAccessToken();
  const response = await fetch(
    `${apiBase}/v2/payments/captures/${encodeURIComponent(params.captureId)}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: params.amount
        ? JSON.stringify({
            amount: {
              value: params.amount.value,
              currency_code: params.amount.currencyCode
            }
          })
        : "{}"
    }
  );

  if (!response.ok) {
    throw new ApiError("PayPal provider error", 502);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function verifyPaypalWebhookSignature(params: {
  transmissionId: string | null;
  transmissionTime: string | null;
  certUrl: string | null;
  authAlgo: string | null;
  transmissionSig: string | null;
  webhookEvent: Record<string, unknown>;
}) {
  const webhookId = getRequiredEnv("PAYPAL_WEBHOOK_ID");
  const { token, apiBase } = await getPaypalAccessToken();

  if (
    !params.transmissionId ||
    !params.transmissionTime ||
    !params.certUrl ||
    !params.authAlgo ||
    !params.transmissionSig
  ) {
    throw new ApiError("Missing PayPal signature headers", 400);
  }

  const response = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      transmission_id: params.transmissionId,
      transmission_time: params.transmissionTime,
      cert_url: params.certUrl,
      auth_algo: params.authAlgo,
      transmission_sig: params.transmissionSig,
      webhook_id: webhookId,
      webhook_event: params.webhookEvent
    })
  });

  if (!response.ok) {
    throw new ApiError("PayPal provider error", 502);
  }

  const payload = (await response.json()) as { verification_status?: string };
  if (payload.verification_status !== "SUCCESS") {
    throw new ApiError("Invalid PayPal signature", 400);
  }
}

export function assertAmountCentsMatch(expectedTotal: number, providerAmountCents: number) {
  const expectedCents = normalizeAmountToCents(expectedTotal);
  if (providerAmountCents !== expectedCents) {
    throw new ApiError("Payment amount mismatch", 409);
  }
}
