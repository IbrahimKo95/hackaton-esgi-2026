import { type ZodError, type ZodType } from "zod";

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export function json<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export function error(status: number, message: string, details?: unknown): Response {
  return json(
    {
      error: {
        message,
        details,
      },
    },
    status,
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Invalid JSON payload.");
  }
}

export async function parseJsonWithSchema<T>(
  request: Request,
  schema: ZodType<T>,
  message = "Validation failed.",
): Promise<T> {
  const payload = await readJson(request);
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw zodValidationError(parsed.error, message);
  }

  return parsed.data;
}

export function toIntId(value: string, name = "id"): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `${name} must be a positive integer.`);
  }

  return parsed;
}

export function zodValidationError(
  zodError: ZodError,
  message = "Validation failed.",
): HttpError {
  return new HttpError(400, message, {
    issues: zodError.issues.map((issue) => ({
      code: issue.code,
      path: issue.path,
      message: issue.message,
    })),
  });
}

export function handleRouteError(cause: unknown): Response {
  if (cause instanceof HttpError) {
    return error(cause.status, cause.message, cause.details);
  }

  if (cause instanceof Error) {
    return error(500, "Internal server error.", cause.message);
  }

  return error(500, "Internal server error.");
}
