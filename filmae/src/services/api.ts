import { API_URL_NOT_CONFIGURED_INTERNAL_MESSAGE, env } from '@/config/env';
import { ServiceError } from '@/services/service-error';
import { tokenStorage } from '@/services/token-storage';
import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';

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

api.interceptors.request.use(async (requestConfig) => {
  if (!env.apiUrl) {
    throw new ServiceError({
      cause: new Error(API_URL_NOT_CONFIGURED_INTERNAL_MESSAGE),
      code: 'DEPENDENCY_UNAVAILABLE',
      message: 'Serviço indisponível no momento. Tente novamente em instantes.',
    });
  }

  const accessToken = await tokenStorage.getAccessToken();
  if (accessToken) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return requestConfig;
});

let refreshing: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken || !env.apiUrl) {
    return null;
  }

  try {
    const { data } = await axios.post(`${env.apiUrl}/auth/refresh`, { refreshToken });
    await tokenStorage.saveTokens(data);
    return data.accessToken as string;
  } catch {
    await tokenStorage.clear();
    return null;
  }
}

// Se o access token expirar, tenta renovar uma vez e repete a requisição.
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && error.config) {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const isAuthRoute = original.url?.startsWith('/auth/');

      if (!original._retry && !isAuthRoute) {
        original._retry = true;
        refreshing ??= refreshTokens().finally(() => {
          refreshing = null;
        });
        const newToken = await refreshing;

        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      }
    }

    return Promise.reject(error);
  },
);
