import type { RegistrationAccount, RegistrationPayload } from '@/types/registration';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type RegistrationContextValue = {
  account: RegistrationAccount | null;
  buildPayload: () => RegistrationPayload | null;
  cinephileStory: string;
  clearRegistration: () => void;
  favoriteMovieIds: string[];
  genreIds: string[];
  saveAccount: (account: RegistrationAccount) => void;
  saveCinephileStory: (story: string) => void;
  saveFavoriteMovies: (movieIds: string[]) => void;
  saveGenres: (genreIds: string[]) => void;
};

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

function RegistrationProvider({ children }: PropsWithChildren) {
  const [account, setAccount] = useState<RegistrationAccount | null>(null);
  const [cinephileStory, setCinephileStory] = useState('');
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [favoriteMovieIds, setFavoriteMovieIds] = useState<string[]>([]);

  const saveAccount = useCallback((nextAccount: RegistrationAccount) => {
    setAccount(nextAccount);
  }, []);

  const saveGenres = useCallback((nextGenreIds: string[]) => {
    setGenreIds(nextGenreIds);
  }, []);

  const saveCinephileStory = useCallback((nextStory: string) => {
    setCinephileStory(nextStory);
  }, []);

  const saveFavoriteMovies = useCallback((nextMovieIds: string[]) => {
    setFavoriteMovieIds(nextMovieIds);
  }, []);

  const clearRegistration = useCallback(() => {
    setAccount(null);
    setCinephileStory('');
    setGenreIds([]);
    setFavoriteMovieIds([]);
  }, []);

  const buildPayload = useCallback((): RegistrationPayload | null => {
    if (!account) {
      return null;
    }

    return {
      ...account,
      cinephileStory,
      genreIds,
      favoriteMovieIds,
    };
  }, [account, cinephileStory, favoriteMovieIds, genreIds]);

  const value = useMemo(
    () => ({
      account,
      buildPayload,
      cinephileStory,
      clearRegistration,
      favoriteMovieIds,
      genreIds,
      saveAccount,
      saveCinephileStory,
      saveFavoriteMovies,
      saveGenres,
    }),
    [
      account,
      buildPayload,
      cinephileStory,
      clearRegistration,
      favoriteMovieIds,
      genreIds,
      saveAccount,
      saveCinephileStory,
      saveFavoriteMovies,
      saveGenres,
    ],
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const context = useContext(RegistrationContext);

  if (!context) {
    throw new Error('useRegistration deve ser usado dentro de RegistrationProvider.');
  }

  return context;
}
export default RegistrationProvider;