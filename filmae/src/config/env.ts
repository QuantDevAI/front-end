const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const apiTimeoutMs = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 10000);

if (!apiUrl) {
  throw new Error(
    'A variável EXPO_PUBLIC_API_URL não foi configurada. Crie um arquivo .env.local com base no .env.example.',
  );
}

if (!Number.isFinite(apiTimeoutMs) || apiTimeoutMs <= 0) {
  throw new Error('A variável EXPO_PUBLIC_API_TIMEOUT_MS deve conter um número maior que zero.');
}

export const env = {
  apiUrl: apiUrl.replace(/\/+$/, ''),
  apiTimeoutMs,
} as const;
