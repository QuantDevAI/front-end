export type AuthLoadingMode = 'login' | 'profile' | 'register';

export type AuthLoadingTargetRoute =
  '/home' | '/login' | '/onboarding' | '/perfil-criado' | '/preferencias-generos';

type PendingAuthLoadingTask = {
  mode: AuthLoadingMode;
  run: () => Promise<AuthLoadingTargetRoute>;
};

let pendingAuthLoadingTask: PendingAuthLoadingTask | null = null;

export function setPendingAuthLoadingTask(task: PendingAuthLoadingTask) {
  pendingAuthLoadingTask = task;
}

export function getPendingAuthLoadingTask() {
  return pendingAuthLoadingTask;
}

export function clearPendingAuthLoadingTask() {
  pendingAuthLoadingTask = null;
}

export async function runPendingAuthLoadingTask() {
  if (!pendingAuthLoadingTask) {
    throw new Error('Nenhuma ação pendente de autenticação foi encontrada.');
  }

  return pendingAuthLoadingTask.run();
}
