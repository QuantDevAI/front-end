export type ApiRequestIdMeta = {
  requestId: string;
};

export type ApiEnvelope<TData, TMeta = ApiRequestIdMeta> = {
  data: TData;
  meta?: TMeta;
};

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RESOURCE_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'STATE_CONFLICT'
  | 'ONBOARDING_INCOMPLETE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export type ApiErrorShape = {
  code: ApiErrorCode;
  fields?: ApiFieldError[];
  message: string;
  requestId?: string;
};

export type ApiErrorEnvelope = {
  error: ApiErrorShape;
};

export type ApiPaginationMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
