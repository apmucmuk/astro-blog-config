import { ApiError, type ApiFieldError } from "./errors";

export type StrictObjectSchema<T> = {
  keys: readonly (keyof T & string)[];
  parse: (value: Record<string, unknown>) => T | ApiFieldError[];
};

export function assertStrictObject<T>(value: unknown, schema: StrictObjectSchema<T>): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Expected a JSON object.");
  }

  const record = value as Record<string, unknown>;
  const allowed = new Set<string>(schema.keys);
  const unknownFields = Object.keys(record)
    .filter((key) => !allowed.has(key))
    .map((field) => ({ field, message: "Unknown field." }));

  if (unknownFields.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Request body contains unknown fields.", unknownFields);
  }

  const parsed = schema.parse(record);
  if (Array.isArray(parsed)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Request body failed validation.", parsed);
  }

  return parsed;
}

export function requireNonEmptyString(value: unknown, field: string): string | ApiFieldError {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return { field, message: "Expected a non-empty string." };
}

export function requireIntegerInRange(
  value: unknown,
  field: string,
  min: number,
  max: number,
): number | ApiFieldError {
  if (typeof value === "number" && Number.isInteger(value) && value >= min && value <= max) {
    return value;
  }

  return { field, message: `Expected an integer between ${min} and ${max}.` };
}
