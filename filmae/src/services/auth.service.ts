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
import { ServiceError } from './service-error';

const AUTH_ROUTES = {
  google: '/auth/google',
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  register: '/auth/register',
} as const;

const MOCK_DELAY_MS = 650;
const SESSION_DURATION_SECONDS = 900;

type MockSession = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

let mockUserIdSeed = 1;
let _mockLastSession: MockSession | null = null;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function buildMockSession(): MockSession {
  const tokenSeed = Date.now().toString(36);

  return {
    accessToken: `mock-access-${tokenSeed}`,
    expiresIn: SESSION_DURATION_SECONDS,
    refreshToken: `mock-refresh-${tokenSeed}`,
  };
}

export const authService = {
  routes: AUTH_ROUTES,

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const email = request.email.trim().toLocaleLowerCase('pt-BR');
    const name = request.name.trim();

    if (!name || !email || !request.password) {
      throw new ServiceError({
        code: 'VALIDATION_ERROR',
        message: 'Nome, e-mail e senha são obrigatórios para criar conta.',
      });
    }

    await wait(MOCK_DELAY_MS);

    const session = buildMockSession();
    _mockLastSession = session;

    return {
      ...session,
      user: {
        email,
        id: mockUserIdSeed++,
        name,
        onboardingCompleted: false,
      },
    };
  },

  async login(request: LoginRequest): Promise<LoginResponse> {
    const email = request.email.trim().toLocaleLowerCase('pt-BR');

    if (!email || !request.password) {
      throw new ServiceError({
        code: 'VALIDATION_ERROR',
        message: 'E-mail e senha são obrigatórios para entrar.',
      });
    }

    await wait(MOCK_DELAY_MS);

    const session = buildMockSession();
    _mockLastSession = session;

    return {
      ...session,
      nextScreen: 'home',
      user: {
        email,
        id: 1,
        name: 'Usuário Filmaê',
        onboardingCompleted: true,
      },
    };
  },

  async loginWithGoogle(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    if (!request.idToken.trim()) {
      throw new ServiceError({
        code: 'VALIDATION_ERROR',
        message: 'O idToken do Google é obrigatório.',
      });
    }

    await wait(MOCK_DELAY_MS);

    const session = buildMockSession();
    _mockLastSession = session;

    return {
      ...session,
      nextScreen: 'home',
      user: {
        email: 'usuario.google@filmae.app',
        id: 1,
        name: 'Usuário Google',
        onboardingCompleted: true,
      },
    };
  },

  async refreshSession(request: RefreshSessionRequest): Promise<RefreshSessionResponse> {
    if (!request.refreshToken.trim()) {
      throw new ServiceError({
        code: 'UNAUTHORIZED',
        message: 'Não foi possível renovar a sessão sem refresh token.',
      });
    }

    await wait(MOCK_DELAY_MS);

    const session = buildMockSession();
    _mockLastSession = session;

    return session;
  },

  async logout(): Promise<void> {
    await wait(250);
    _mockLastSession = null;
  },

  // Utilitário apenas para desenvolvimento local, sem impacto em produção.
  clearMockSession() {
    _mockLastSession = null;
  },
};
