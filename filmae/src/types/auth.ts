export type AuthNextScreen = 'home' | 'onboarding';

export type AuthUser = {
  email: string;
  id: string; // o backend usa UUID
  name: string;
  onboardingCompleted: boolean;
};

export type AuthSessionTokens = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

export type RegisterRequest = {
  email: string;
  name: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = AuthSessionTokens & {
  nextScreen: AuthNextScreen;
  user: AuthUser;
};

export type RegisterResponse = LoginResponse;

export type RefreshSessionRequest = {
  refreshToken: string;
};

export type RefreshSessionResponse = AuthSessionTokens;
