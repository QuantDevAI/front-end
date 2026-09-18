import type { RegistrationPayload, RegistrationResult } from '@/types/registration';

const MOCK_REQUEST_MS = 900;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export const registrationService = {
  async completeRegistration(payload: RegistrationPayload): Promise<RegistrationResult> {
    if (!payload.email || !payload.name || !payload.password) {
      throw new Error('Os dados básicos do cadastro estão incompletos.');
    }

    // O endpoint e o formato de resposta ainda não foram informados.
    // Ao conectar o backend, substitua apenas este mock por `api.post(...)`.
    await wait(MOCK_REQUEST_MS);

    return {
      userId: 'preview-user',
    };
  },
};