import type {
  CompleteOnboardingResponse,
  OnboardingMovie,
  OnboardingProgress,
  SaveOnboardingFavoriteMoviesRequest,
  SaveOnboardingFavoriteMoviesResponse,
  SaveOnboardingGenresRequest,
  SaveOnboardingGenresResponse,
  SaveOnboardingProfileStoryRequest,
  SaveOnboardingProfileStoryResponse,
} from '@/types/onboarding';
import { ServiceError } from './service-error';

const ONBOARDING_ROUTES = {
  complete: '/users/me/onboarding/complete',
  favoriteMovies: '/users/me/onboarding/favorite-movies',
  genres: '/users/me/onboarding/genres',
  progress: '/users/me/onboarding',
  profileStory: '/users/me/onboarding/profile-story',
} as const;

const MOCK_DELAY_MS = 450;
const STORY_MAX_LENGTH = 400;

type OnboardingMockState = {
  completed: boolean;
  favoriteMovies: OnboardingMovie[];
  genres: string[];
  profileStory: string | null;
};

let mockState: OnboardingMockState = {
  completed: false,
  favoriteMovies: [],
  genres: [],
  profileStory: null,
};

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function inferCurrentStep(state: OnboardingMockState): OnboardingProgress['currentStep'] {
  if (!state.genres.length) {
    return 'genres';
  }

  if (!state.favoriteMovies.length) {
    return 'favoriteMovies';
  }

  return 'profileStory';
}

export const onboardingService = {
  routes: ONBOARDING_ROUTES,

  async getProgress(): Promise<OnboardingProgress> {
    await wait(MOCK_DELAY_MS);

    return {
      completed: mockState.completed,
      currentStep: inferCurrentStep(mockState),
      favoriteMovies: mockState.favoriteMovies,
      genres: mockState.genres,
      profileStory: mockState.profileStory,
    };
  },

  async saveGenres(request: SaveOnboardingGenresRequest): Promise<SaveOnboardingGenresResponse> {
    await wait(MOCK_DELAY_MS);
    mockState = {
      ...mockState,
      genres: [...request.genres],
    };

    return {
      genres: mockState.genres,
      nextStep: 'favoriteMovies',
    };
  },

  async saveFavoriteMovies(
    request: SaveOnboardingFavoriteMoviesRequest,
  ): Promise<SaveOnboardingFavoriteMoviesResponse> {
    await wait(MOCK_DELAY_MS);
    mockState = {
      ...mockState,
      favoriteMovies: request.movieIds.map((movieId) => ({
        id: movieId,
        title: movieId,
      })),
    };

    return {
      favoriteMovies: mockState.favoriteMovies,
      nextStep: 'profileStory',
    };
  },

  async saveProfileStory(
    request: SaveOnboardingProfileStoryRequest,
  ): Promise<SaveOnboardingProfileStoryResponse> {
    const text = request.text.trim();

    if (text.length > STORY_MAX_LENGTH) {
      throw new ServiceError({
        code: 'VALIDATION_ERROR',
        message: `O texto do perfil pode ter no máximo ${STORY_MAX_LENGTH} caracteres.`,
      });
    }

    await wait(MOCK_DELAY_MS);
    mockState = {
      ...mockState,
      profileStory: text || null,
    };

    return {
      profileStory: text,
      nextStep: 'complete',
    };
  },

  async completeOnboarding(): Promise<CompleteOnboardingResponse> {
    await wait(MOCK_DELAY_MS);
    mockState = {
      ...mockState,
      completed: true,
    };

    return {
      completed: true,
      completedAt: new Date().toISOString(),
      nextScreen: 'home',
    };
  },

  clearMockState() {
    mockState = {
      completed: false,
      favoriteMovies: [],
      genres: [],
      profileStory: null,
    };
  },
};
