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

// Formato real dos erros do backend Spring
type BackendErrorResponse = {
  error?: string;
  errors?: Record<string, string>;
  message?: string;
  status?: number;
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
    const status = error.response?.status;
    const body = error.response?.data;

    if (!error.response) {
      return new ServiceError({
        cause: error,
        code: 'NETWORK_ERROR',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
      });
    }

    const fields = body?.errors
      ? Object.entries(body.errors).map(([field, message]) => ({ field, message }))
      : undefined;

    if (status === 409) {
      return new ServiceError({
        cause: error,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Este e-mail já está cadastrado.',
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

    if (status === 400) {
      return new ServiceError({
        cause: error,
        code: 'VALIDATION_ERROR',
        fields,
        message:
          'Dados inválidos. A senha precisa ter 8+ caracteres, com maiúscula, minúscula, número e símbolo.',
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
