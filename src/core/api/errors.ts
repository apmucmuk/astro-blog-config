export type ApiErrorCode =
  | "BAD_REQUEST"
  | "METHOD_NOT_ALLOWED"
  | "NOT_FOUND"
  | "ORIGIN_NOT_ALLOWED"
  | "RATE_LIMITED"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: ApiFieldError[];
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fields?: ApiFieldError[];

  constructor(status: number, code: ApiErrorCode, message: string, fields?: ApiFieldError[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function toApiErrorBody(error: ApiError): ApiErrorBody {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.fields ? { fields: error.fields } : {}),
    },
  };
}
