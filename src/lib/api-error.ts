export type TwoFaErrorCode =
  | "2FA_REQUIRED"
  | "2FA_INVALID"
  | "2FA_LOCKED"
  | "2FA_ENROLLMENT_REQUIRED"
  | "2FA_NOT_AVAILABLE"
  | "2FA_DISABLE_NOT_ALLOWED";

export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function getApiErrorCode(error: unknown): string | undefined {
  return error instanceof ApiError ? error.code : undefined;
}

export function throwFromApiBody(data: unknown, httpStatus: number): never {
  const body = data as {
    message?: string;
    error?: string | { code?: string };
    statusCode?: number;
  };
  const code =
    typeof body?.error === "object" && body.error
      ? body.error.code
      : undefined;
  const message =
    body?.message ||
    (typeof body?.error === "string" ? body.error : undefined) ||
    `API Error: ${httpStatus}`;
  throw new ApiError(message, body?.statusCode || httpStatus, code);
}
