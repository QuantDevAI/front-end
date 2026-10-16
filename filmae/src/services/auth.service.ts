import { api } from '@/services/api';
import { env } from '@/config/env';
import { mockApi } from '@/services/mock-api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
  LoginRequest,
  LoginResponse,
  RefreshSessionRequest,
  RefreshSessionResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/auth';

const AUTH_ROUTES = {
  google: '/auth/google',
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  register: '/auth/register',
} as const;

export const authService = {
  routes: AUTH_ROUTES,

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    if (env.useMockApi) {
      return mockApi.auth.register(request);
    }

    try {
      const response = await api.post<ApiEnvelope<RegisterResponse>>(AUTH_ROUTES.register, request);

      return requireApiData(
        response.data,
        'Resposta inválida ao criar conta. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível criar a conta no momento.');
    }
  },

  async login(request: LoginRequest): Promise<LoginResponse> {
    if (env.useMockApi) {
      return mockApi.auth.login(request);
    }

    try {
      const response = await api.post<ApiEnvelope<LoginResponse>>(AUTH_ROUTES.login, request);

      return requireApiData(
        response.data,
        'Resposta inválida ao realizar login. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível realizar login no momento.');
    }
  },

  async loginWithGoogle(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    if (env.useMockApi) {
      return mockApi.auth.loginWithGoogle(request);
    }

    try {
      const response = await api.post<ApiEnvelope<GoogleLoginResponse>>(
        AUTH_ROUTES.google,
        request,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao autenticar com Google. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível autenticar com Google no momento.');
    }
  },

  async refreshSession(request: RefreshSessionRequest): Promise<RefreshSessionResponse> {
    if (env.useMockApi) {
      return mockApi.auth.refreshSession(request);
    }

    try {
      const response = await api.post<ApiEnvelope<RefreshSessionResponse>>(
        AUTH_ROUTES.refresh,
        request,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao renovar sessão. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível renovar a sessão no momento.');
    }
  },

  async logout(): Promise<void> {
    if (env.useMockApi) {
      return mockApi.auth.logout();
    }

    try {
      await api.post(AUTH_ROUTES.logout);
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível encerrar a sessão no momento.');
    }
  },
};
