export type DashboardKpis = {
  favoriteCount: number;
  ratedCount: number;
  rewatchCount: number;
  totalMinutesWatched: number;
  watchedCount: number;
  watchlistCount: number;
};

export type DashboardGenreInsight = {
  count: number;
  genre: string;
};

export type WatchHistoryEntry = {
  movieId: string;
  rating: number | null;
  title: string;
  watchedAt: string;
  year: number;
};

export type DashboardPayload = {
  historyPreview: WatchHistoryEntry[];
  kpis: DashboardKpis;
  topGenres: DashboardGenreInsight[];
  updatedAt: string;
};
