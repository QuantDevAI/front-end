import type { ApiEnvelope, ApiErrorCode, ApiFieldError } from '@/types/api';
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

type BackendErrorResponse = {
  error?: {
    code?: ApiErrorCode;
    fields?: ApiFieldError[];
    message?: string;
    requestId?: string;
  };
};

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

  if (isAxiosError<BackendErrorResponse>(error)) {
    const backendError = error.response?.data?.error;
    const status = error.response?.status;

    return new ServiceError({
      cause: error,
      code: backendError?.code ?? (status === 401 ? 'UNAUTHORIZED' : 'NETWORK_ERROR'),
      fields: backendError?.fields,
      message: backendError?.message ?? fallbackMessage,
      requestId: backendError?.requestId,
      status,
    });
  }

  if (error instanceof Error) {
    return new ServiceError({
      cause: error,
      code: 'UNKNOWN_ERROR',
      message: fallbackMessage,
    });
  }

  return new ServiceError({
    cause: error,
    code: 'UNKNOWN_ERROR',
    message: fallbackMessage,
  });
}
