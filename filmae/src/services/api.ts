import { API_URL_NOT_CONFIGURED_INTERNAL_MESSAGE, env } from '@/config/env';
import { ServiceError } from '@/services/service-error';
import axios from 'axios';

// A tipagem do Axios expõe `create` na exportação padrão.
// Esta regra específica do ESLint gera um falso positivo.
// eslint-disable-next-line import/no-named-as-default-member
export const api = axios.create({
  baseURL: env.apiUrl ?? undefined,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((requestConfig) => {
  if (!env.apiUrl) {
    return Promise.reject(
      new ServiceError({
        cause: new Error(API_URL_NOT_CONFIGURED_INTERNAL_MESSAGE),
        code: 'DEPENDENCY_UNAVAILABLE',
        message: 'Serviço indisponível no momento. Tente novamente em instantes.',
      }),
    );
  }

  return requestConfig;
});
