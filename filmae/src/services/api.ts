import { env } from '@/config/env';
import axios from 'axios';

// A tipagem do Axios expõe `create` na exportação padrão.
// Esta regra específica do ESLint gera um falso positivo.
// eslint-disable-next-line import/no-named-as-default-member
export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
  },
});
