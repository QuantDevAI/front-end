export type AppBootstrapResult = {
  initialRoute: '/onboarding';
};

const MOCK_INITIALIZATION_MS = 1200;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export const appBootstrapService = {
  async initialize(): Promise<AppBootstrapResult> {
    // Quando autenticação e sessão existirem, a restauração deve ser feita aqui.
    // Qualquer chamada HTTP futura deve usar a instância `api` de services/api.ts.
    await wait(MOCK_INITIALIZATION_MS);

    return {
      initialRoute: '/onboarding',
    };
  },
};