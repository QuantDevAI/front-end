import type { MovieCatalogItem, MovieListItem, MovieUserState } from '@/types/movies';

const DEFAULT_USER_STATE: MovieUserState = {
  favorite: false,
  rating: null,
  rewatch: false,
  watched: false,
  watchlist: false,
};

export const MOVIE_CATALOG: MovieCatalogItem[] = [
  {
    id: 'tt0816692',
    title: 'Interestelar',
    originalTitle: 'Interstellar',
    type: 'movie',
    year: 2014,
    runtimeMinutes: 169,
    genres: ['Ficção Científica', 'Drama', 'Aventura'],
    imdb: {
      rating: 8.7,
      votes: 2200000,
    },
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    synopsis:
      'Com a sobrevivência da Terra ameaçada, exploradores atravessam um buraco de minhoca em busca de um novo lar para a humanidade.',
    compatibilityScore: 97,
    compatibilityReasons: [
      'Gênero favorito: Ficção Científica',
      'Diretor recorrente no seu histórico',
      'Narrativa longa e complexa',
      'Alta avaliação global',
    ],
    gradientColors: ['#0A0A1A', '#0D1B3E', '#1A0A2E', '#0D0D0D'],
    accentColor: '#4A90E2',
  },
  {
    id: 'tt15398776',
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    type: 'movie',
    year: 2023,
    runtimeMinutes: 180,
    genres: ['Drama', 'História', 'Thriller'],
    imdb: {
      rating: 8.9,
      votes: 900000,
    },
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.'],
    synopsis:
      'A trajetória do físico J. Robert Oppenheimer e as consequências humanas e políticas por trás do Projeto Manhattan.',
    compatibilityScore: 94,
    compatibilityReasons: [
      'Diretor recorrente no seu histórico',
      'Filmes longos e densos',
      'Drama histórico de alta crítica',
      'Ritmo próximo dos seus favoritos',
    ],
    gradientColors: ['#1A0500', '#3D1000', '#1A0000', '#0A0000'],
    accentColor: '#E85C00',
  },
  {
    id: 'tt1160419',
    title: 'Duna',
    originalTitle: 'Dune',
    type: 'movie',
    year: 2021,
    runtimeMinutes: 155,
    genres: ['Ficção Científica', 'Aventura', 'Drama'],
    imdb: {
      rating: 8.0,
      votes: 850000,
    },
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Rebecca Ferguson', 'Zendaya'],
    synopsis:
      'Paul Atreides precisa liderar seu destino em Arrakis, planeta hostil e essencial para o futuro do universo.',
    compatibilityScore: 89,
    compatibilityReasons: [
      'Sci-fi épica com worldbuilding forte',
      'Narrativa densa e contemplativa',
      'Direção visualmente marcante',
      'Duração próxima da sua média de sessão',
    ],
    gradientColors: ['#1A1400', '#3D2F00', '#2A1A00', '#0A0800'],
    accentColor: '#C8A000',
  },
  {
    id: 'tt0468569',
    title: 'O Cavaleiro das Trevas',
    originalTitle: 'The Dark Knight',
    type: 'movie',
    year: 2008,
    runtimeMinutes: 152,
    genres: ['Ação', 'Crime', 'Drama'],
    imdb: {
      rating: 9.0,
      votes: 2800000,
    },
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    synopsis:
      'Batman enfrenta o Coringa em Gotham, enquanto sua guerra contra o crime desafia os limites morais do herói.',
    compatibilityScore: 92,
    compatibilityReasons: [
      'Diretor recorrente no seu histórico',
      'Conflito psicológico intenso',
      'Clássico com alta aderência ao seu perfil',
      'Equilíbrio entre ação e drama',
    ],
    gradientColors: ['#000000', '#1A0026', '#0D001A', '#000000'],
    accentColor: '#7C3AED',
  },
  {
    id: 'tt1375666',
    title: 'A Origem',
    originalTitle: 'Inception',
    type: 'movie',
    year: 2010,
    runtimeMinutes: 148,
    genres: ['Ficção Científica', 'Thriller', 'Ação'],
    imdb: {
      rating: 8.8,
      votes: 2400000,
    },
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    synopsis:
      'Um especialista em extração de segredos em sonhos recebe a missão de implantar uma ideia na mente de um alvo.',
    compatibilityScore: 96,
    compatibilityReasons: [
      'Narrativa não linear com reviravoltas',
      'Diretor recorrente no seu histórico',
      'Sci-fi com tensão psicológica',
      'Ritmo e duração alinhados ao seu gosto',
    ],
    gradientColors: ['#001A33', '#003366', '#00194D', '#000D1A'],
    accentColor: '#00AAFF',
  },
  {
    id: 'tt1856101',
    title: 'Blade Runner 2049',
    originalTitle: 'Blade Runner 2049',
    type: 'movie',
    year: 2017,
    runtimeMinutes: 164,
    genres: ['Ficção Científica', 'Drama', 'Mistério'],
    imdb: {
      rating: 8.0,
      votes: 650000,
    },
    director: 'Denis Villeneuve',
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
    synopsis:
      'Um novo blade runner descobre um segredo capaz de alterar a sociedade e inicia uma busca por respostas do passado.',
    compatibilityScore: 88,
    compatibilityReasons: [
      'Sci-fi atmosférica e introspectiva',
      'Direção visual marcante',
      'Suspense investigativo',
      'Duração alta, como seus favoritos',
    ],
    gradientColors: ['#0A0A0A', '#1A1500', '#2A2000', '#0A0800'],
    accentColor: '#FF8C00',
  },
  {
    id: 'tt6751668',
    title: 'Parasita',
    originalTitle: 'Parasite',
    type: 'movie',
    year: 2019,
    runtimeMinutes: 132,
    genres: ['Drama', 'Thriller', 'Comédia'],
    imdb: {
      rating: 8.5,
      votes: 900000,
    },
    director: 'Bong Joon-ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    synopsis:
      'Duas famílias de classes opostas se conectam em uma trama satírica com tensão crescente e consequências imprevisíveis.',
    compatibilityScore: 82,
    compatibilityReasons: [
      'Thriller com crítica social',
      'Narrativa imprevisível',
      'Forte execução de roteiro',
      'Mistura de gêneros com boa aderência',
    ],
    gradientColors: ['#001A00', '#003300', '#001A00', '#000800'],
    accentColor: '#00CC44',
  },
  {
    id: 'tt0137523',
    title: 'Clube da Luta',
    originalTitle: 'Fight Club',
    type: 'movie',
    year: 1999,
    runtimeMinutes: 139,
    genres: ['Drama', 'Thriller', 'Mistério'],
    imdb: {
      rating: 8.8,
      votes: 2200000,
    },
    director: 'David Fincher',
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    synopsis:
      'Um homem desiludido cria um clube clandestino com um vendedor carismático, e o movimento escala para algo muito maior.',
    compatibilityScore: 85,
    compatibilityReasons: [
      'Thriller psicológico de alta tensão',
      'Tema existencial e provocativo',
      'Roteiro com reviravolta forte',
      'Clássico alinhado ao seu histórico',
    ],
    gradientColors: ['#1A0000', '#330000', '#1A0000', '#0A0000'],
    accentColor: '#CC0000',
  },
];

export const CATALOG_GENRES = Array.from(
  new Set(MOVIE_CATALOG.flatMap((movie) => movie.genres)),
).sort((genreA, genreB) => genreA.localeCompare(genreB, 'pt-BR'));

export function getCatalogMovieById(movieId: string) {
  return MOVIE_CATALOG.find((movie) => movie.id === movieId) ?? null;
}

export function toMovieListItem(
  movie: MovieCatalogItem,
  userState: MovieUserState = DEFAULT_USER_STATE,
): MovieListItem {
  return {
    compatibilityScore: movie.compatibilityScore,
    genres: movie.genres,
    id: movie.id,
    imdb: movie.imdb,
    runtimeMinutes: movie.runtimeMinutes,
    title: movie.title,
    userState,
    year: movie.year,
  };
}
