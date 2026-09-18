import type { ImageSourcePropType } from 'react-native';

export type GenreOption = {
  id: string;
  label: string;
};

export type MovieOption = {
  accentColor: string;
  gradientColors: readonly [string, string, string, string];
  id: string;
  imdb: number;
  posterSource?: ImageSourcePropType;
  title: string;
  year: number;
};

export const GENRES: GenreOption[] = [
  { id: 'acao', label: 'Ação' },
  { id: 'aventura', label: 'Aventura' },
  { id: 'animacao', label: 'Animação' },
  { id: 'comedia', label: 'Comédia' },
  { id: 'crime', label: 'Crime' },
  { id: 'documentario', label: 'Documentário' },
  { id: 'drama', label: 'Drama' },
  { id: 'fantasia', label: 'Fantasia' },
  { id: 'ficcao-cientifica', label: 'Ficção Científica' },
  { id: 'terror', label: 'Terror' },
  { id: 'romance', label: 'Romance' },
  { id: 'suspense', label: 'Suspense' },
  { id: 'thriller', label: 'Thriller' },
  { id: 'misterio', label: 'Mistério' },
];

export const MOVIES: MovieOption[] = [
  {
    id: '1',
    title: 'Interestelar',
    year: 2014,
    imdb: 8.7,
    gradientColors: ['#0A0A1A', '#0D1B3E', '#1A0A2E', '#0D0D0D'],
    accentColor: '#4A90E2',
  },
  {
    id: '2',
    title: 'Oppenheimer',
    year: 2023,
    imdb: 8.9,
    gradientColors: ['#1A0500', '#3D1000', '#1A0000', '#0A0000'],
    accentColor: '#E85C00',
  },
  {
    id: '3',
    title: 'Duna',
    year: 2021,
    imdb: 8.0,
    gradientColors: ['#1A1400', '#3D2F00', '#2A1A00', '#0A0800'],
    accentColor: '#C8A000',
  },
  {
    id: '4',
    title: 'O Cavaleiro das Trevas',
    year: 2008,
    imdb: 9.0,
    gradientColors: ['#000000', '#1A0026', '#0D001A', '#000000'],
    accentColor: '#7C3AED',
  },
  {
    id: '5',
    title: 'A Origem',
    year: 2010,
    imdb: 8.8,
    gradientColors: ['#001A33', '#003366', '#00194D', '#000D1A'],
    accentColor: '#00AAFF',
  },
  {
    id: '6',
    title: 'Blade Runner 2049',
    year: 2017,
    imdb: 8.0,
    gradientColors: ['#0A0A0A', '#1A1500', '#2A2000', '#0A0800'],
    accentColor: '#FF8C00',
  },
  {
    id: '7',
    title: 'Parasita',
    year: 2019,
    imdb: 8.5,
    gradientColors: ['#001A00', '#003300', '#001A00', '#000800'],
    accentColor: '#00CC44',
  },
  {
    id: '8',
    title: 'Clube da Luta',
    year: 1999,
    imdb: 8.8,
    gradientColors: ['#1A0000', '#330000', '#1A0000', '#0A0000'],
    accentColor: '#CC0000',
  },
];