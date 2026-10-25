import { getProfilePhotoUri, subscribeProfilePhoto } from '@/services/profile-photo.service';
import { useSyncExternalStore } from 'react';

// Retorna o endereço da foto do usuário (ou null) e atualiza sozinho quando ela muda.
export function useProfilePhoto(userId: number | null | undefined): string | null {
  return useSyncExternalStore(
    subscribeProfilePhoto,
    () => (userId === null || userId === undefined ? null : getProfilePhotoUri(userId)),
    () => null,
  );
}
