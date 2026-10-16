export type OnboardingStep = 'genres' | 'favoriteMovies' | 'profileStory' | 'complete';

export type OnboardingMovie = {
  id: string;
  title: string;
};

export type OnboardingProgress = {
  completed: boolean;
  currentStep: Exclude<OnboardingStep, 'complete'>;
  favoriteMovies: OnboardingMovie[];
  genres: string[];
  profileStory: string | null;
};

export type SaveOnboardingGenresRequest = {
  genres: string[];
};

export type SaveOnboardingGenresResponse = {
  genres: string[];
  nextStep: 'favoriteMovies';
};

export type SaveOnboardingFavoriteMoviesRequest = {
  movieIds: string[];
};

export type SaveOnboardingFavoriteMoviesResponse = {
  favoriteMovies: OnboardingMovie[];
  nextStep: 'profileStory';
};

export type SaveOnboardingProfileStoryRequest = {
  text: string;
};

export type SaveOnboardingProfileStoryResponse = {
  nextStep: 'complete';
  profileStory: string;
};

export type CompleteOnboardingResponse = {
  completed: true;
  completedAt: string;
  nextScreen: 'home';
};
