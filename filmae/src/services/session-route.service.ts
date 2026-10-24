import { onboardingService } from '@/services/onboarding.service';
import { tokenStorage } from '@/services/token-storage';

export type AuthenticatedAppRoute =
  | '/filmes-favoritos'
  | '/home'
  | '/perfil-cinefilo'
  | '/preferencias-generos';

export type PublicAppRoute = '/onboarding';

export async function resolveAuthenticatedRoute(): Promise<AuthenticatedAppRoute> {
  const progress = await onboardingService.getProgress();

  if (progress.completed) {
    return '/home';
  }

  if (progress.currentStep === 'favoriteMovies') {
    return '/filmes-favoritos';
  }

  if (progress.currentStep === 'profileStory') {
    return '/perfil-cinefilo';
  }

  return '/preferencias-generos';
}

export async function resolveStartupRoute(): Promise<AuthenticatedAppRoute | PublicAppRoute> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    return '/onboarding';
  }

  try {
    return await resolveAuthenticatedRoute();
  } catch {
    return '/onboarding';
  }
}
