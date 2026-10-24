import { api } from '@/services/api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import { tokenStorage } from '@/services/token-storage';
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

async function persistSession(tokens: { accessToken: string; refreshToken: string }) {
  await tokenStorage.saveTokens(tokens);
}

export const authService = {
  routes: AUTH_ROUTES,

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post<ApiEnvelope<RegisterResponse>>(AUTH_ROUTES.register, request);
      const session = requireApiData(
        response.data,
        'Resposta inválida ao criar a conta. Tente novamente em instantes.',
      );
      await persistSession(session);
      return session;
    } catch (error: unknown) {
      await tokenStorage.clear();
      throw normalizeServiceError(error, 'Não foi possível criar a conta no momento.');
    }
  },

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiEnvelope<LoginResponse>>(AUTH_ROUTES.login, request);
      const session = requireApiData(
        response.data,
        'Resposta inválida ao realizar login. Tente novamente em instantes.',
      );
      await persistSession(session);
      return session;
    } catch (error: unknown) {
      await tokenStorage.clear();
      throw normalizeServiceError(error, 'Não foi possível realizar login no momento.');
    }
  },

  async loginWithGoogle(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    try {
      const response = await api.post<ApiEnvelope<GoogleLoginResponse>>(AUTH_ROUTES.google, request);
      const session = requireApiData(
        response.data,
        'Resposta inválida ao entrar com o Google. Tente novamente em instantes.',
      );
      await persistSession(session);
      return session;
    } catch (error: unknown) {
      await tokenStorage.clear();
      throw normalizeServiceError(error, 'Não foi possível entrar com o Google no momento.');
    }
  },

  async refreshSession(request: RefreshSessionRequest): Promise<RefreshSessionResponse> {
    try {
      const response = await api.post<ApiEnvelope<RefreshSessionResponse>>(
        AUTH_ROUTES.refresh,
        request,
      );
      const tokens = requireApiData(
        response.data,
        'Resposta inválida ao renovar a sessão. Tente novamente em instantes.',
      );
      await persistSession(tokens);
      return tokens;
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível renovar a sessão no momento.');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post(AUTH_ROUTES.logout);
    } catch {
      // mesmo se a API falhar, a sessão local é encerrada
    } finally {
      await tokenStorage.clear();
    }
  },
};
