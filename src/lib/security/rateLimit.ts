import { ApiError } from "@/lib/api";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip;
}

export function assertRateLimit(params: {
  request: Request;
  key: string;
  limit: number;
  windowMs: number;
  message?: string;
}) {
  const identifier = getClientIdentifier(params.request);
  const bucketKey = `${params.key}:${identifier}`;
  const now = Date.now();

  const existing = buckets.get(bucketKey);
  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + params.windowMs });
    return;
  }

  if (existing.count >= params.limit) {
    throw new ApiError(params.message ?? "Too many requests", 429);
  }

  existing.count += 1;
  buckets.set(bucketKey, existing);
}
