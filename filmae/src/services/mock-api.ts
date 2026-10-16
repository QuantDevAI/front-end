import { CATALOG_GENRES, MOVIE_CATALOG, getCatalogMovieById } from '@/data/catalog';
import { ServiceError } from '@/services/service-error';
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
import type {
  CollectionFilter,
  CollectionMoviePayload,
  CollectionPayload,
  CollectionSummary,
  GetCollectionRequest,
  UpsertCollectionMovieRequest,
} from '@/types/collection';
import type { DashboardGenreInsight, DashboardPayload, WatchHistoryEntry } from '@/types/dashboard';
import type { HomePayload } from '@/types/home';
import type { AppNotification, NotificationsPayload } from '@/types/notifications';
import type {
  CompleteOnboardingResponse,
  OnboardingProgress,
  SaveOnboardingFavoriteMoviesRequest,
  SaveOnboardingFavoriteMoviesResponse,
  SaveOnboardingGenresRequest,
  SaveOnboardingGenresResponse,
  SaveOnboardingProfileStoryRequest,
  SaveOnboardingProfileStoryResponse,
} from '@/types/onboarding';
import type { UpdateUserProfileRequest, UserProfilePayload } from '@/types/profile';
import type {
  DeleteMovieRatingResponse,
  SaveMovieRatingRequest,
  SaveMovieRatingResponse,
} from '@/types/ratings';
import type {
  GenreCatalogItem,
  MovieDetails,
  MovieListItem,
  MovieSearchFilters,
  MovieSearchResult,
  MovieUserState,
} from '@/types/movies';

const MOCK_DELAY_MS = 240;
const SESSION_DURATION_SECONDS = 900;

let mockUser = {
  email: 'romulo@filmae.app',
  id: 1,
  name: 'Rômulo',
  onboardingCompleted: true,
};

let mockProfile: UserProfilePayload = {
  preferences: {
    receiveRecommendationsByEmail: true,
    spoilerModeEnabled: false,
  },
  user: {
    bio: 'Cinéfilo de ficção científica, thrillers e histórias que fazem pensar.',
    createdAt: '2026-08-01T15:30:00.000Z',
    email: mockUser.email,
    id: mockUser.id,
    name: mockUser.name,
  },
};

let mockOnboardingProgress: OnboardingProgress = {
  completed: true,
  currentStep: 'profileStory',
  favoriteMovies: [],
  genres: [],
  profileStory: null,
};

let mockNotifications: AppNotification[] = [
  {
    createdAt: '2026-10-16T18:40:00.000Z',
    id: 'ntf-1',
    message: 'Novo filme do dia disponível para você.',
    read: false,
    title: 'Filme do dia',
    type: 'daily_recommendation',
  },
  {
    createdAt: '2026-10-15T21:10:00.000Z',
    id: 'ntf-2',
    message: 'Sua lista de filmes para assistir recebeu novas sugestões.',
    read: false,
    title: 'Atualização da coleção',
    type: 'collection',
  },
  {
    createdAt: '2026-10-14T13:05:00.000Z',
    id: 'ntf-3',
    message: 'Seu perfil cinematográfico foi atualizado com base nas últimas avaliações.',
    read: true,
    title: 'Perfil atualizado',
    type: 'system',
  },
];

const DEFAULT_MOVIE_USER_STATE: MovieUserState = {
  favorite: false,
  rating: null,
  rewatch: false,
  watched: false,
  watchlist: false,
};

const mockMovieUserState = new Map<string, MovieUserState>([
  [
    'tt0816692',
    {
      favorite: true,
      rating: 5,
      rewatch: true,
      watched: true,
      watchlist: false,
    },
  ],
  [
    'tt15398776',
    {
      favorite: false,
      rating: null,
      rewatch: false,
      watched: false,
      watchlist: true,
    },
  ],
  [
    'tt1160419',
    {
      favorite: false,
      rating: 4,
      rewatch: false,
      watched: true,
      watchlist: false,
    },
  ],
]);

const mockWatchedAt = new Map<string, string>([
  ['tt0816692', '2026-10-12T20:15:00.000Z'],
  ['tt1160419', '2026-10-11T22:40:00.000Z'],
]);

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function cloneState(state: MovieUserState): MovieUserState {
  return {
    favorite: state.favorite,
    rating: state.rating,
    rewatch: state.rewatch,
    watched: state.watched,
    watchlist: state.watchlist,
  };
}

function ensureMovieState(movieId: string): MovieUserState {
  const existingState = mockMovieUserState.get(movieId);

  if (existingState) {
    return existingState;
  }

  const newState = cloneState(DEFAULT_MOVIE_USER_STATE);
  mockMovieUserState.set(movieId, newState);
  return newState;
}

function normalizeMovieState(state: MovieUserState): MovieUserState {
  const normalized = cloneState(state);

  if (normalized.watched) {
    normalized.watchlist = false;
  }

  if (normalized.watchlist) {
    normalized.watched = false;
    normalized.rewatch = false;
  }

  if (normalized.rewatch) {
    normalized.watched = true;
    normalized.watchlist = false;
  }

  if (!normalized.watched) {
    normalized.rewatch = false;
  }

  return normalized;
}

function updateWatchedTimestamp(movieId: string, watched: boolean) {
  if (watched) {
    if (!mockWatchedAt.has(movieId)) {
      mockWatchedAt.set(movieId, new Date().toISOString());
    }
    return;
  }

  mockWatchedAt.delete(movieId);
}

function persistMovieState(movieId: string, nextState: MovieUserState): MovieUserState {
  const normalized = normalizeMovieState(nextState);
  mockMovieUserState.set(movieId, normalized);
  updateWatchedTimestamp(movieId, normalized.watched);
  return cloneState(normalized);
}

function getMovieListItem(movieId: string): MovieListItem {
  const movie = getCatalogMovieById(movieId);

  if (!movie) {
    throw new ServiceError({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Filme não encontrado no catálogo local.',
    });
  }

  return {
    accentColor: movie.accentColor,
    compatibilityScore: movie.compatibilityScore,
    director: movie.director,
    genres: movie.genres,
    gradientColors: movie.gradientColors,
    id: movie.id,
    imdb: movie.imdb,
    runtimeMinutes: movie.runtimeMinutes,
    title: movie.title,
    userState: cloneState(ensureMovieState(movie.id)),
    year: movie.year,
  };
}

function buildCollectionSummary(): CollectionSummary {
  const summary: CollectionSummary = {
    favorite: 0,
    rated: 0,
    rewatch: 0,
    total: 0,
    watched: 0,
    watchlist: 0,
  };

  MOVIE_CATALOG.forEach((movie) => {
    const state = ensureMovieState(movie.id);
    const inCollection = state.favorite || state.rewatch || state.watched || state.watchlist;

    if (inCollection) {
      summary.total += 1;
    }

    if (state.favorite) {
      summary.favorite += 1;
    }

    if (state.rewatch) {
      summary.rewatch += 1;
    }

    if (state.watched) {
      summary.watched += 1;
    }

    if (state.watchlist) {
      summary.watchlist += 1;
    }

    if (state.rating !== null) {
      summary.rated += 1;
    }
  });

  return summary;
}

function buildCollectionItems(filter: CollectionFilter): MovieListItem[] {
  return MOVIE_CATALOG.map((movie) => getMovieListItem(movie.id)).filter((movie) => {
    if (filter === 'all') {
      return (
        movie.userState.favorite ||
        movie.userState.rewatch ||
        movie.userState.watched ||
        movie.userState.watchlist
      );
    }

    return movie.userState[filter];
  });
}

function buildCollectionPayload(filter: CollectionFilter): CollectionPayload {
  return {
    items: buildCollectionItems(filter),
    summary: buildCollectionSummary(),
  };
}

function buildCollectionMoviePayload(movieId: string): CollectionMoviePayload {
  return {
    movie: getMovieListItem(movieId),
    summary: buildCollectionSummary(),
    updatedAt: new Date().toISOString(),
  };
}

function updateCollectionState(
  movieId: string,
  request: UpsertCollectionMovieRequest,
): MovieUserState {
  const currentState = ensureMovieState(movieId);

  const nextState: MovieUserState = {
    favorite: request.favorite ?? currentState.favorite,
    rating: currentState.rating,
    rewatch: request.rewatch ?? currentState.rewatch,
    watched: request.watched ?? currentState.watched,
    watchlist: request.watchlist ?? currentState.watchlist,
  };

  return persistMovieState(movieId, nextState);
}

function createSessionTokens() {
  const tokenSeed = Date.now().toString(36);

  return {
    accessToken: `mock-access-${tokenSeed}`,
    expiresIn: SESSION_DURATION_SECONDS,
    refreshToken: `mock-refresh-${tokenSeed}`,
  };
}

function buildNotificationsPayload(): NotificationsPayload {
  const items = [...mockNotifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    items,
    unreadCount: items.filter((item) => !item.read).length,
  };
}

function buildWatchHistory(): WatchHistoryEntry[] {
  return MOVIE_CATALOG.map((movie) => {
    const state = ensureMovieState(movie.id);

    if (!state.watched) {
      return null;
    }

    return {
      movieId: movie.id,
      rating: state.rating,
      title: movie.title,
      watchedAt: mockWatchedAt.get(movie.id) ?? new Date().toISOString(),
      year: movie.year,
    } satisfies WatchHistoryEntry;
  })
    .filter((entry): entry is WatchHistoryEntry => entry !== null)
    .sort((a, b) => b.watchedAt.localeCompare(a.watchedAt));
}

function buildTopGenres(history: WatchHistoryEntry[]): DashboardGenreInsight[] {
  const counter = new Map<string, number>();

  history.forEach((entry) => {
    const movie = getCatalogMovieById(entry.movieId);

    if (!movie) {
      return;
    }

    movie.genres.forEach((genre) => {
      counter.set(genre, (counter.get(genre) ?? 0) + 1);
    });
  });

  return Array.from(counter.entries())
    .map(([genre, count]) => ({ count, genre }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre, 'pt-BR'))
    .slice(0, 4);
}

function buildDashboardPayload(): DashboardPayload {
  const history = buildWatchHistory();
  const summary = buildCollectionSummary();

  const totalMinutesWatched = MOVIE_CATALOG.reduce((accumulator, movie) => {
    const state = ensureMovieState(movie.id);
    return accumulator + (state.watched ? movie.runtimeMinutes : 0);
  }, 0);

  return {
    historyPreview: history.slice(0, 10),
    kpis: {
      favoriteCount: summary.favorite,
      ratedCount: summary.rated,
      rewatchCount: summary.rewatch,
      totalMinutesWatched,
      watchedCount: summary.watched,
      watchlistCount: summary.watchlist,
    },
    topGenres: buildTopGenres(history),
    updatedAt: new Date().toISOString(),
  };
}

export const mockApi = {
  auth: {
    async register(request: RegisterRequest): Promise<RegisterResponse> {
      const email = request.email.trim().toLocaleLowerCase('pt-BR');
      const name = request.name.trim();

      if (!name || !email || !request.password) {
        throw new ServiceError({
          code: 'VALIDATION_ERROR',
          message: 'Nome, e-mail e senha são obrigatórios.',
        });
      }

      await wait(MOCK_DELAY_MS);

      mockUser = {
        ...mockUser,
        email,
        name,
        onboardingCompleted: false,
      };

      mockProfile = {
        ...mockProfile,
        user: {
          ...mockProfile.user,
          email,
          name,
        },
      };

      mockOnboardingProgress = {
        ...mockOnboardingProgress,
        completed: false,
        currentStep: 'genres',
      };

      return {
        ...createSessionTokens(),
        user: {
          email,
          id: mockUser.id,
          name,
          onboardingCompleted: false,
        },
      };
    },

    async login(request: LoginRequest): Promise<LoginResponse> {
      if (!request.email.trim() || !request.password.trim()) {
        throw new ServiceError({
          code: 'VALIDATION_ERROR',
          message: 'E-mail e senha são obrigatórios.',
        });
      }

      await wait(MOCK_DELAY_MS);

      const email = request.email.trim().toLocaleLowerCase('pt-BR');
      mockUser = {
        ...mockUser,
        email,
      };

      return {
        ...createSessionTokens(),
        nextScreen: mockUser.onboardingCompleted ? 'home' : 'onboarding',
        user: {
          email,
          id: mockUser.id,
          name: mockUser.name,
          onboardingCompleted: mockUser.onboardingCompleted,
        },
      };
    },

    async loginWithGoogle(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
      if (!request.idToken.trim()) {
        throw new ServiceError({
          code: 'VALIDATION_ERROR',
          message: 'ID token do Google é obrigatório.',
        });
      }

      await wait(MOCK_DELAY_MS);

      mockUser = {
        ...mockUser,
        email: 'usuario.google@filmae.app',
        name: 'Usuário Google',
      };

      return {
        ...createSessionTokens(),
        nextScreen: 'home',
        user: {
          email: mockUser.email,
          id: mockUser.id,
          name: mockUser.name,
          onboardingCompleted: true,
        },
      };
    },

    async refreshSession(request: RefreshSessionRequest): Promise<RefreshSessionResponse> {
      if (!request.refreshToken.trim()) {
        throw new ServiceError({
          code: 'UNAUTHORIZED',
          message: 'Refresh token é obrigatório.',
        });
      }

      await wait(MOCK_DELAY_MS);
      return createSessionTokens();
    },

    async logout(): Promise<void> {
      await wait(MOCK_DELAY_MS / 2);
    },
  },

  onboarding: {
    async getProgress(): Promise<OnboardingProgress> {
      await wait(MOCK_DELAY_MS);
      return { ...mockOnboardingProgress };
    },

    async saveGenres(request: SaveOnboardingGenresRequest): Promise<SaveOnboardingGenresResponse> {
      await wait(MOCK_DELAY_MS);

      mockOnboardingProgress = {
        ...mockOnboardingProgress,
        currentStep: 'favoriteMovies',
        genres: [...request.genres],
      };

      return {
        genres: [...request.genres],
        nextStep: 'favoriteMovies',
      };
    },

    async saveFavoriteMovies(
      request: SaveOnboardingFavoriteMoviesRequest,
    ): Promise<SaveOnboardingFavoriteMoviesResponse> {
      await wait(MOCK_DELAY_MS);

      const favoriteMovies = request.movieIds.map((movieId) => ({
        id: movieId,
        title: getCatalogMovieById(movieId)?.title ?? movieId,
      }));

      mockOnboardingProgress = {
        ...mockOnboardingProgress,
        currentStep: 'profileStory',
        favoriteMovies,
      };

      return {
        favoriteMovies,
        nextStep: 'profileStory',
      };
    },

    async saveProfileStory(
      request: SaveOnboardingProfileStoryRequest,
    ): Promise<SaveOnboardingProfileStoryResponse> {
      const text = request.text.trim();

      if (text.length > 400) {
        throw new ServiceError({
          code: 'VALIDATION_ERROR',
          message: 'O texto do perfil pode ter no máximo 400 caracteres.',
        });
      }

      await wait(MOCK_DELAY_MS);

      mockOnboardingProgress = {
        ...mockOnboardingProgress,
        profileStory: text || null,
      };

      return {
        nextStep: 'complete',
        profileStory: text,
      };
    },

    async completeOnboarding(): Promise<CompleteOnboardingResponse> {
      await wait(MOCK_DELAY_MS);

      mockUser = {
        ...mockUser,
        onboardingCompleted: true,
      };

      mockOnboardingProgress = {
        ...mockOnboardingProgress,
        completed: true,
      };

      return {
        completed: true,
        completedAt: new Date().toISOString(),
        nextScreen: 'home',
      };
    },
  },

  home: {
    async getHome(): Promise<HomePayload> {
      await wait(MOCK_DELAY_MS);

      const [dailyMovie, ...otherMovies] = MOVIE_CATALOG;

      if (!dailyMovie) {
        throw new ServiceError({
          code: 'RESOURCE_NOT_FOUND',
          message: 'Catálogo mock vazio para Home.',
        });
      }

      const summary = buildCollectionSummary();

      return {
        collectionSummary: {
          favorite: summary.favorite,
          rewatch: summary.rewatch,
          watched: summary.watched,
          watchlist: summary.watchlist,
        },
        dailyMovie: {
          ...getMovieListItem(dailyMovie.id),
          reason:
            'Narrativa complexa, ficção científica e duração longa aparecem entre suas preferências.',
        },
        outsideBubble: otherMovies.slice(5, 8).map((movie) => getMovieListItem(movie.id)),
        recommendations: otherMovies.slice(0, 5).map((movie) => getMovieListItem(movie.id)),
        unreadNotifications: buildNotificationsPayload().unreadCount,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          onboardingCompleted: mockUser.onboardingCompleted,
        },
      };
    },
  },

  movies: {
    async getGenres(): Promise<GenreCatalogItem[]> {
      await wait(MOCK_DELAY_MS);

      return CATALOG_GENRES.map((genre) => ({
        id: genre,
        movieCount: MOVIE_CATALOG.filter((movie) => movie.genres.includes(genre)).length,
        name: genre,
      }));
    },

    async getMovieDetails(movieId: string): Promise<MovieDetails> {
      await wait(MOCK_DELAY_MS);

      const movie = getCatalogMovieById(movieId);

      if (!movie) {
        throw new ServiceError({
          code: 'RESOURCE_NOT_FOUND',
          message: 'Filme não encontrado no catálogo local.',
        });
      }

      return {
        ...getMovieListItem(movie.id),
        cast: movie.cast,
        compatibilityReasons: movie.compatibilityReasons,
        originalTitle: movie.originalTitle,
        synopsis: movie.synopsis,
        type: movie.type,
      };
    },

    async searchMovies(filters: MovieSearchFilters): Promise<MovieSearchResult> {
      await wait(MOCK_DELAY_MS);

      const page = filters.page ?? 0;
      const requestedSize = filters.size ?? 20;
      const size = Math.min(Math.max(requestedSize, 1), 50);
      const normalizedQuery = filters.q?.trim().toLocaleLowerCase('pt-BR') ?? '';
      const normalizedGenres = new Set(
        filters.genres?.map((genre) => genre.trim()).filter(Boolean) ?? [],
      );

      const filteredMovies = MOVIE_CATALOG.filter((movie) => {
        const queryMatches =
          !normalizedQuery ||
          movie.title.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
          movie.originalTitle.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
          movie.director.toLocaleLowerCase('pt-BR').includes(normalizedQuery);

        const genresMatch =
          !normalizedGenres.size || movie.genres.some((genre) => normalizedGenres.has(genre));

        const yearFromMatches = filters.yearFrom === undefined || movie.year >= filters.yearFrom;
        const yearToMatches = filters.yearTo === undefined || movie.year <= filters.yearTo;
        const ratingMatches =
          filters.minRating === undefined || movie.imdb.rating >= filters.minRating;

        return queryMatches && genresMatch && yearFromMatches && yearToMatches && ratingMatches;
      });

      const totalElements = filteredMovies.length;
      const totalPages = Math.max(Math.ceil(totalElements / size), 1);
      const startIndex = page * size;
      const pagedMovies = filteredMovies
        .slice(startIndex, startIndex + size)
        .map((movie) => getMovieListItem(movie.id));

      return {
        data: pagedMovies,
        meta: {
          page,
          size,
          totalElements,
          totalPages,
        },
      };
    },
  },

  collection: {
    async getCollection(request: GetCollectionRequest = {}): Promise<CollectionPayload> {
      await wait(MOCK_DELAY_MS);
      return buildCollectionPayload(request.filter ?? 'all');
    },

    async getMovieCollectionState(movieId: string): Promise<CollectionMoviePayload> {
      await wait(MOCK_DELAY_MS);
      return buildCollectionMoviePayload(movieId);
    },

    async upsertMovieCollectionState(
      movieId: string,
      request: UpsertCollectionMovieRequest,
    ): Promise<CollectionMoviePayload> {
      const hasAtLeastOneField =
        request.favorite !== undefined ||
        request.rewatch !== undefined ||
        request.watched !== undefined ||
        request.watchlist !== undefined;

      if (!hasAtLeastOneField) {
        throw new ServiceError({
          code: 'VALIDATION_ERROR',
          message: 'Informe ao menos um estado para atualizar a coleção.',
        });
      }

      await wait(MOCK_DELAY_MS);
      updateCollectionState(movieId, request);
      return buildCollectionMoviePayload(movieId);
    },

    async removeMovieFromCollection(movieId: string): Promise<CollectionMoviePayload> {
      await wait(MOCK_DELAY_MS);
      const currentState = ensureMovieState(movieId);
      persistMovieState(movieId, {
        ...currentState,
        favorite: false,
        rewatch: false,
        watched: false,
        watchlist: false,
      });

      return buildCollectionMoviePayload(movieId);
    },
  },

  ratings: {
    async saveMovieRating(
      movieId: string,
      request: SaveMovieRatingRequest,
    ): Promise<SaveMovieRatingResponse> {
      if (!Number.isInteger(request.rating) || request.rating < 1 || request.rating > 5) {
        throw new ServiceError({
          code: 'VALIDATION_ERROR',
          message: 'A nota deve ser um número inteiro entre 1 e 5.',
        });
      }

      await wait(MOCK_DELAY_MS);

      const currentState = ensureMovieState(movieId);
      persistMovieState(movieId, {
        ...currentState,
        rating: request.rating,
        watched: true,
      });

      return buildCollectionMoviePayload(movieId);
    },

    async deleteMovieRating(movieId: string): Promise<DeleteMovieRatingResponse> {
      await wait(MOCK_DELAY_MS);

      const currentState = ensureMovieState(movieId);
      persistMovieState(movieId, {
        ...currentState,
        rating: null,
      });

      return buildCollectionMoviePayload(movieId);
    },

    async getMovieRating(movieId: string): Promise<number | null> {
      await wait(MOCK_DELAY_MS);
      return ensureMovieState(movieId).rating;
    },
  },

  dashboard: {
    async getDashboard(): Promise<DashboardPayload> {
      await wait(MOCK_DELAY_MS);
      return buildDashboardPayload();
    },

    async getWatchHistory(): Promise<WatchHistoryEntry[]> {
      await wait(MOCK_DELAY_MS);
      return buildWatchHistory();
    },
  },

  profile: {
    async getMe(): Promise<UserProfilePayload> {
      await wait(MOCK_DELAY_MS);

      return {
        preferences: { ...mockProfile.preferences },
        user: { ...mockProfile.user },
      };
    },

    async updateMe(request: UpdateUserProfileRequest): Promise<UserProfilePayload> {
      const name = request.name.trim();
      const bio = request.bio.trim();

      if (!name) {
        throw new ServiceError({
          code: 'VALIDATION_ERROR',
          message: 'Informe seu nome para salvar o perfil.',
        });
      }

      if (bio.length > 240) {
        throw new ServiceError({
          code: 'VALIDATION_ERROR',
          message: 'A bio pode ter no máximo 240 caracteres.',
        });
      }

      await wait(MOCK_DELAY_MS);

      mockProfile = {
        ...mockProfile,
        user: {
          ...mockProfile.user,
          bio,
          name,
        },
      };

      mockUser = {
        ...mockUser,
        name,
      };

      return {
        preferences: { ...mockProfile.preferences },
        user: { ...mockProfile.user },
      };
    },
  },

  notifications: {
    async getNotifications(): Promise<NotificationsPayload> {
      await wait(MOCK_DELAY_MS);
      return buildNotificationsPayload();
    },

    async markAsRead(notificationId: string): Promise<NotificationsPayload> {
      await wait(MOCK_DELAY_MS);

      const exists = mockNotifications.some((notification) => notification.id === notificationId);

      if (!exists) {
        throw new ServiceError({
          code: 'RESOURCE_NOT_FOUND',
          message: 'Notificação não encontrada.',
        });
      }

      mockNotifications = mockNotifications.map((notification) => {
        if (notification.id !== notificationId) {
          return notification;
        }

        return {
          ...notification,
          read: true,
        };
      });

      return buildNotificationsPayload();
    },

    async markAllAsRead(): Promise<NotificationsPayload> {
      await wait(MOCK_DELAY_MS);

      mockNotifications = mockNotifications.map((notification) => ({
        ...notification,
        read: true,
      }));

      return buildNotificationsPayload();
    },
  },
};
