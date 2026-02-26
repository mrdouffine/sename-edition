import { ApiError } from "@/lib/api";
import { createHmac, timingSafeEqual } from "node:crypto";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

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

/**
 * FedaPay Integration
 * - If FEDAPAY_PRIVATE_KEY and FEDAPAY_PUBLIC_KEY are set: use private/public key auth
 * - Else if FEDAPAY_AUTH_TOKEN is set: use token auth (legacy flow)
 * - Else: use API key on each request via header "FEDAPAY-API-KEY"
 * - account_id is optional; if absent, it's omitted
 */

async function getFedapayAuth() {
  const environment = process.env.FEDAPAY_ENVIRONMENT ?? "sandbox";
  const apiBase = environment === "production" ? "https://api.fedapay.com" : "https://sandbox-api.fedapay.com";

  // Use simple API key authentication (most reliable method)
  const apiKey = process.env.FEDAPAY_API_KEY;

  if (apiKey) {
    return { apiBase, token: null as string | null, apiKey, privateKey: null, publicKey: null };
  }

  // If no API key, try private/public key authentication
  const privateKey = process.env.FEDAPAY_PRIVATE_KEY;
  const publicKey = process.env.FEDAPAY_PUBLIC_KEY;

  if (privateKey && publicKey) {
    return { apiBase, token: null as string | null, apiKey: null, privateKey, publicKey };
  }

  // Fall back to legacy token authentication
  const authToken = process.env.FEDAPAY_AUTH_TOKEN;
  if (authToken) {
    const legacyApiKey = getRequiredEnv("FEDAPAY_API_KEY");
    const response = await fetchWithProxy(`${apiBase}/v1/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "FEDAPAY-API-KEY": legacyApiKey
      },
      body: JSON.stringify({ auth_token: authToken })
    });

    if (!response.ok) {
      throw new ApiError("Fedapay provider error", 502);
    }

    const payload = (await response.json()) as { token?: string };
    if (!payload.token) {
      throw new ApiError("Invalid Fedapay token response", 502);
    }

    return { apiBase, token: payload.token, apiKey: legacyApiKey };
  }

  // No valid authentication method found
  throw new ApiError("No valid Fedapay authentication method configured", 500);
}

// Fetch function that bypasses proxy for Fedapay API calls using Node.js http/https
function fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "GET",
      headers: options.headers as Record<string, string> || {},
      // Disable proxy by using agent without proxy
      agent: isHttps
        ? new https.Agent({
          rejectUnauthorized: true,
          keepAlive: true
        })
        : new http.Agent({
          keepAlive: true
        }),
    };

    const req = client.request(requestOptions, (res) => {
      const chunks: Buffer[] = [];

      res.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf-8");

        // Create a mock Response object
        const response = new Response(body, {
          status: res.statusCode || 500,
          statusText: res.statusMessage || "",
          headers: new Headers(res.headers as Record<string, string>),
        });

        resolve(response);
      });
    });

    req.on("error", (error) => {
      reject(new ApiError(`Network error: ${error.message}`, 502));
    });

    // Write body if present
    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

export async function createFedapayTransaction(params: {
  orderId: string;
  email: string;
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  returnUrl?: string;
}) {
  const { token, apiBase, apiKey, privateKey, publicKey } = await getFedapayAuth();
  const accountId = process.env.FEDAPAY_ACCOUNT_ID;

  if (params.amount <= 0 || !Number.isFinite(params.amount)) {
    throw new ApiError("Invalid transaction amount", 400);
  }

  const body: Record<string, unknown> = {
    amount: Math.round(params.amount * 100),
    currency: params.currency,
    description: params.description,
    customer_email: params.email,
    reference: params.orderId,
    callback_url: params.callbackUrl,
    metadata: { orderId: params.orderId },
    return_url: params.returnUrl
  };

  if (accountId) body.account_id = accountId;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Use private/public key authentication if available
  if (privateKey && publicKey) {
    headers["FEDAPAY-PRIVATE-KEY"] = privateKey;
    headers["FEDAPAY-PUBLIC-KEY"] = publicKey;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    headers["FEDAPAY-API-KEY"] = apiKey!;
  }

  const response = await fetchWithProxy(`${apiBase}/v1/transactions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  // Get response text first to handle non-JSON responses
  const responseText = await response.text();

  if (!response.ok) {
    let errorData: Record<string, unknown>;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      throw new ApiError(`Fedapay error (${response.status}): ${responseText.substring(0, 200)}`, 502);
    }
    throw new ApiError(`Fedapay error: ${JSON.stringify(errorData)}`, 502);
  }

  let payload: {
    id?: string;
    token?: string;
    transaction_link?: { url?: string };
  };

  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new ApiError("Invalid Fedapay transaction response", 502);
  }

  if (!payload.id) {
    throw new ApiError("Invalid Fedapay transaction response", 502);
  }

  return {
    transactionId: payload.id,
    token: payload.token ?? payload.id,
    paymentUrl: payload.transaction_link?.url ?? `${apiBase}/transactions/${payload.id}`
  };
}

export function verifyFedapayWebhookSignature(params: {
  rawBody: string;
  signature: string | null;
  secret?: string;
}) {
  const secret = params.secret ?? getRequiredEnv("FEDAPAY_WEBHOOK_SECRET");

  if (!params.signature) {
    throw new ApiError("Missing Fedapay signature", 400);
  }

  // extract timestamp (t) and signature (s) from the header
  // e.g. "t=1492774577,s=5257a869e7..."
  const elements = params.signature.split(',');
  const sigParams: Record<string, string> = {};
  for (const element of elements) {
    const [key, value] = element.split('=');
    if (key && value) {
      sigParams[key.trim()] = value.trim();
    }
  }

  if (!sigParams.t || (!sigParams.s && !sigParams.v1)) {
    throw new ApiError("Invalid Fedapay signature format", 400);
  }

  const timestamp = sigParams.t;
  const signatureToVerify = sigParams.s || sigParams.v1;

  // The signed payload is the timestamp and the body
  const signedPayload = `${timestamp}.${params.rawBody}`;
  const verifySignature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  const expectedBuffer = Buffer.from(verifySignature, "utf8");
  const providedBuffer = Buffer.from(signatureToVerify, "utf8");

  const isValid = providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);

  // Optional: Prevent replay attacks by checking timestamp age (e.g. max 5 mins)
  const webhookAgeSeconds = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  const isTimingValid = webhookAgeSeconds > 0 && webhookAgeSeconds < 300; // 5 minutes tolerance

  if (!isValid || !isTimingValid) {
    throw new ApiError("Invalid Fedapay signature or expired timestamp", 400);
  }
}

export async function getFedapayTransactionStatus(transactionId: string) {
  const { token, apiBase, apiKey, privateKey, publicKey } = await getFedapayAuth();

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Use private/public key authentication if available
  if (privateKey && publicKey) {
    headers["FEDAPAY-PRIVATE-KEY"] = privateKey;
    headers["FEDAPAY-PUBLIC-KEY"] = publicKey;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    headers["FEDAPAY-API-KEY"] = apiKey!;
  }

  const response = await fetchWithProxy(`${apiBase}/v1/transactions/${encodeURIComponent(transactionId)}`, {
    method: "GET",
    headers
  });

  if (!response.ok) {
    throw new ApiError("Fedapay provider error", 502);
  }

  return response.json() as Promise<Record<string, unknown>>;
}
