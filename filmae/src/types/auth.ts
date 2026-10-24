export type AuthNextScreen = 'home' | 'onboarding';

export type AuthUser = {
  email: string;
  id: number;
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

export type RegisterResponse = AuthSessionTokens & {
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = AuthSessionTokens & {
  nextScreen: AuthNextScreen;
  user: AuthUser;
};

export type GoogleLoginRequest = {
  idToken: string;
};

export type GoogleLoginResponse = LoginResponse;

export type RefreshSessionRequest = {
  refreshToken: string;
};

export type RefreshSessionResponse = AuthSessionTokens;
