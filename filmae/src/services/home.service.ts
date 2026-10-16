import { MOVIE_CATALOG, toMovieListItem } from '@/data/catalog';
import { ServiceError } from '@/services/service-error';
import type { HomePayload } from '@/types/home';

const HOME_ROUTES = {
  home: '/home',
  outsideBubble: '/recommendations/outside-bubble',
  recommendations: '/recommendations',
  recommendationsDaily: '/recommendations/daily',
} as const;

const MOCK_REQUEST_MS = 520;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export const homeService = {
  routes: HOME_ROUTES,

  async getHome(): Promise<HomePayload> {
    await wait(MOCK_REQUEST_MS);

    const [dailyMovie, ...suggestions] = MOVIE_CATALOG;

    if (!dailyMovie) {
      throw new ServiceError({
        code: 'RESOURCE_NOT_FOUND',
        message: 'Não há dados suficientes para montar a Home.',
      });
    }

    const recommendations = suggestions.slice(0, 5).map((movie) => toMovieListItem(movie));
    const outsideBubble = suggestions.slice(5, 8).map((movie) => toMovieListItem(movie));

    return {
      collectionSummary: {
        favorite: 8,
        rewatch: 3,
        watched: 43,
        watchlist: 12,
      },
      dailyMovie: {
        ...toMovieListItem(dailyMovie),
        reason:
          'Narrativa complexa, ficção científica e duração longa aparecem entre suas preferências.',
      },
      outsideBubble,
      recommendations,
      unreadNotifications: 2,
      user: {
        id: 1,
        name: 'Rômulo',
        onboardingCompleted: true,
      },
    };
  },
};
