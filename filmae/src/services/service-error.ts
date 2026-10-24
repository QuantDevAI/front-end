import type { ApiEnvelope, ApiErrorCode, ApiErrorEnvelope, ApiFieldError } from '@/types/api';
import { isAxiosError } from 'axios';

type ServiceErrorInput = {
  cause?: unknown;
  code: ApiErrorCode;
  fields?: ApiFieldError[];
  message: string;
  requestId?: string;
  status?: number;
};

export class ServiceError extends Error {
  readonly cause?: unknown;
  readonly code: ApiErrorCode;
  readonly fields?: ApiFieldError[];
  readonly requestId?: string;
  readonly status?: number;

  constructor({ cause, code, fields, message, requestId, status }: ServiceErrorInput) {
    super(message);
    this.name = 'ServiceError';
    this.cause = cause;
    this.code = code;
    this.fields = fields;
    this.requestId = requestId;
    this.status = status;
  }
}

const KNOWN_ERROR_CODES = new Set<ApiErrorCode>([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'RESOURCE_NOT_FOUND',
  'EMAIL_ALREADY_EXISTS',
  'STATE_CONFLICT',
  'ONBOARDING_INCOMPLETE',
  'RATE_LIMIT_EXCEEDED',
  'INTERNAL_ERROR',
  'DEPENDENCY_UNAVAILABLE',
  'NETWORK_ERROR',
  'UNKNOWN_ERROR',
]);

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (!value || typeof value !== 'object' || !('error' in value)) {
    return false;
  }

  const error = (value as ApiErrorEnvelope).error;
  return Boolean(error && typeof error === 'object' && typeof error.code === 'string');
}

export function requireApiData<TData>(
  payload: ApiEnvelope<TData> | undefined,
  errorMessage: string,
): TData {
  if (!payload || payload.data === undefined) {
    throw new ServiceError({
      code: 'DEPENDENCY_UNAVAILABLE',
      message: errorMessage,
    });
  }

  return payload.data;
}

export function normalizeServiceError(error: unknown, fallbackMessage: string): ServiceError {
  if (error instanceof ServiceError) {
    return error;
  }

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data;

    if (!error.response) {
      return new ServiceError({
        cause: error,
        code: 'NETWORK_ERROR',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
      });
    }

    if (isApiErrorEnvelope(body)) {
      const code = KNOWN_ERROR_CODES.has(body.error.code) ? body.error.code : 'UNKNOWN_ERROR';
      return new ServiceError({
        cause: error,
        code,
        fields: body.error.fields,
        message: body.error.message || fallbackMessage,
        requestId: body.error.requestId,
        status,
      });
    }

    if (status === 401) {
      return new ServiceError({
        cause: error,
        code: 'UNAUTHORIZED',
        message: 'E-mail ou senha incorretos.',
        status,
      });
    }

    return new ServiceError({
      cause: error,
      code: status && status >= 500 ? 'INTERNAL_ERROR' : 'UNKNOWN_ERROR',
      message: fallbackMessage,
      status,
    });
  }

  return new ServiceError({
    cause: error,
    code: 'UNKNOWN_ERROR',
    message: fallbackMessage,
  });
}
