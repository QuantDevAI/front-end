import {
  CATALOG_GENRES,
  getCatalogMovieById,
  MOVIE_CATALOG,
  toMovieListItem,
} from '@/data/catalog';
import { ServiceError } from '@/services/service-error';
import type {
  GenreCatalogItem,
  MovieDetails,
  MovieSearchFilters,
  MovieSearchResult,
} from '@/types/movies';

const MOVIES_ROUTES = {
  genres: '/genres',
  movieDetails: '/movies/{tconst}',
  movies: '/movies',
} as const;

const MOCK_REQUEST_MS = 480;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function mapCatalogMovieToDetails(movieId: string): MovieDetails {
  const movie = getCatalogMovieById(movieId);

  if (!movie) {
    throw new ServiceError({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Filme não encontrado no catálogo.',
    });
  }

  return {
    accentColor: movie.accentColor,
    cast: movie.cast,
    compatibilityReasons: movie.compatibilityReasons,
    compatibilityScore: movie.compatibilityScore,
    director: movie.director,
    genres: movie.genres,
    gradientColors: movie.gradientColors,
    id: movie.id,
    imdb: movie.imdb,
    originalTitle: movie.originalTitle,
    runtimeMinutes: movie.runtimeMinutes,
    synopsis: movie.synopsis,
    title: movie.title,
    type: movie.type,
    userState: {
      favorite: false,
      rating: null,
      rewatch: false,
      watched: false,
      watchlist: false,
    },
    year: movie.year,
  };
}

export const moviesService = {
  routes: MOVIES_ROUTES,

  async getGenres(): Promise<GenreCatalogItem[]> {
    await wait(MOCK_REQUEST_MS);

    return CATALOG_GENRES.map((genre) => ({
      id: genre,
      movieCount: MOVIE_CATALOG.filter((movie) => movie.genres.includes(genre)).length,
      name: genre,
    }));
  },

  async getMovieDetails(movieId: string): Promise<MovieDetails> {
    await wait(MOCK_REQUEST_MS);
    return mapCatalogMovieToDetails(movieId);
  },

  async searchMovies(filters: MovieSearchFilters): Promise<MovieSearchResult> {
    await wait(MOCK_REQUEST_MS);

    const page = filters.page ?? 0;
    const requestedSize = filters.size ?? 20;
    const size = Math.min(Math.max(requestedSize, 1), 50);
    const normalizedQuery = filters.q?.trim().toLocaleLowerCase('pt-BR') ?? '';
    const normalizedGenres = new Set(filters.genres?.map((genre) => genre.trim()).filter(Boolean));

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
      .map((movie) => toMovieListItem(movie));

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
};
