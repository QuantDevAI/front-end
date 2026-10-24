import { api } from '@/services/api';
import { normalizeServiceError } from '@/services/service-error';
import { tokenStorage } from '@/services/token-storage';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshSessionRequest,
  RefreshSessionResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/auth';

const AUTH_ROUTES = {
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/users/me',
  refresh: '/auth/refresh',
  register: '/auth/register',
} as const;

// Formatos reais devolvidos pelo backend Spring
type BackendTokens = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: string;
};

type BackendUser = {
  email: string;
  id: string;
  name: string;
};

export const authService = {
  routes: AUTH_ROUTES,

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      await api.post<BackendUser>(AUTH_ROUTES.register, request);
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível criar a conta no momento.');
    }

    // O backend não devolve tokens no cadastro: entra automaticamente em seguida.
    const session = await authService.login({
      email: request.email,
      password: request.password,
    });

    return { ...session, nextScreen: 'onboarding' };
  },

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const { data: tokens } = await api.post<BackendTokens>(AUTH_ROUTES.login, request);
      await tokenStorage.saveTokens(tokens);

      // O login só devolve tokens; os dados do usuário vêm de /users/me.
      const { data: me } = await api.get<BackendUser>(AUTH_ROUTES.me);

      const user: AuthUser = {
        email: me.email,
        id: me.id,
        name: me.name,
        onboardingCompleted: false,
      };

      return {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
        nextScreen: 'home',
        refreshToken: tokens.refreshToken,
        user,
      };
    } catch (error: unknown) {
      await tokenStorage.clear();
      throw normalizeServiceError(error, 'Não foi possível realizar login no momento.');
    }
  },

  async refreshSession(request: RefreshSessionRequest): Promise<RefreshSessionResponse> {
    try {
      const { data } = await api.post<BackendTokens>(AUTH_ROUTES.refresh, request);
      await tokenStorage.saveTokens(data);

      return {
        accessToken: data.accessToken,
        expiresIn: data.expiresIn,
        refreshToken: data.refreshToken,
      };
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
