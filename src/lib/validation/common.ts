import mongoose from "mongoose";
import { ApiError } from "@/lib/api";

export function asObject(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ApiError("Body must be a JSON object", 400);
  }

  return input as Record<string, unknown>;
}

export function asString(value: unknown, field: string, { min = 1, max = 5000 } = {}) {
  if (typeof value !== "string") {
    throw new ApiError(`${field} must be a string`, 400);
  }

  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw new ApiError(`${field} is required`, 400);
  }
  if (trimmed.length > max) {
    throw new ApiError(`${field} is too long`, 400);
  }

  return trimmed;
}

export function asEmail(value: unknown, field = "email") {
  const email = asString(value, field, { min: 3, max: 320 }).toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) {
    throw new ApiError("Invalid email format", 400);
  }

  return email;
}

export function asPassword(value: unknown, field = "password") {
  const password = asString(value, field, { min: 8, max: 128 });
  return password;
}

export function asNumber(value: unknown, field: string, { min, max }: { min?: number; max?: number } = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ApiError(`${field} must be a number`, 400);
  }

  if (min !== undefined && value < min) {
    throw new ApiError(`${field} must be >= ${min}`, 400);
  }

  if (max !== undefined && value > max) {
    throw new ApiError(`${field} must be <= ${max}`, 400);
  }

  return value;
}

export function asObjectId(value: unknown, field: string) {
  const id = asString(value, field, { min: 1, max: 64 });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(`${field} must be a valid ObjectId`, 400);
  }

  return id;
}

export function asEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ApiError(`${field} must be one of: ${allowed.join(", ")}`, 400);
  }

  return value as T;
}

export function asOptionalString(value: unknown, field: string, max = 5000) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return asString(value, field, { min: 1, max });
}

export function asOptionalEmail(value: unknown, field = "email") {
  if (value === undefined || value === null) {
    return undefined;
  }

  return asEmail(value, field);
}
