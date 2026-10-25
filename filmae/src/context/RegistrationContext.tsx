import type { RegistrationAccount, RegistrationPayload } from '@/types/registration';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type RegistrationDraft = {
  account: Omit<RegistrationAccount, 'password'> | null;
  cinephileStory: string;
  favoriteMovieIds: string[];
  genreIds: string[];
};

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
const DRAFT_KEY = 'filmae.registrationDraft';

const EMPTY_DRAFT: RegistrationDraft = {
  account: null,
  cinephileStory: '',
  favoriteMovieIds: [],
  genreIds: [],
};

function readDraft(): RegistrationDraft {
  if (typeof localStorage === 'undefined') {
    return EMPTY_DRAFT;
  }

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return EMPTY_DRAFT;
    }

    const parsed = JSON.parse(raw) as Partial<RegistrationDraft>;
    return {
      account:
        parsed.account?.email && parsed.account.name
          ? { email: parsed.account.email, name: parsed.account.name }
          : null,
      cinephileStory: parsed.cinephileStory ?? '',
      favoriteMovieIds: Array.isArray(parsed.favoriteMovieIds) ? parsed.favoriteMovieIds : [],
      genreIds: Array.isArray(parsed.genreIds) ? parsed.genreIds : [],
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

function writeDraft(draft: RegistrationDraft) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // storage cheio ou bloqueado
  }
}

function clearDraft() {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

function toAccount(draftAccount: RegistrationDraft['account']): RegistrationAccount | null {
  if (!draftAccount) {
    return null;
  }

  return { ...draftAccount, password: '' };
}

export function RegistrationProvider({ children }: PropsWithChildren) {
  const initialDraft = readDraft();
  const [account, setAccount] = useState<RegistrationAccount | null>(() =>
    toAccount(initialDraft.account),
  );
  const [cinephileStory, setCinephileStory] = useState(initialDraft.cinephileStory);
  const [genreIds, setGenreIds] = useState<string[]>(initialDraft.genreIds);
  const [favoriteMovieIds, setFavoriteMovieIds] = useState<string[]>(initialDraft.favoriteMovieIds);

  useEffect(() => {
    if (!account && !cinephileStory && genreIds.length === 0 && favoriteMovieIds.length === 0) {
      return;
    }

    writeDraft({
      account: account ? { email: account.email, name: account.name } : null,
      cinephileStory,
      favoriteMovieIds,
      genreIds,
    });
  }, [account, cinephileStory, favoriteMovieIds, genreIds]);

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
    clearDraft();
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
