import {
  getVoiceNoteUri,
  getVoiceNoteVersion,
  subscribeVoiceNotes,
} from '@/services/voice-note.service';
import { useSyncExternalStore } from 'react';

// Devolve o áudio salvo do filme (ou null) e atualiza sozinho quando ele muda.
export function useVoiceNote(movieId: string | undefined) {
  const uri = useSyncExternalStore(
    subscribeVoiceNotes,
    () => (movieId ? getVoiceNoteUri(movieId) : null),
    () => null,
  );
  const version = useSyncExternalStore(subscribeVoiceNotes, getVoiceNoteVersion, () => 0);

  return { uri, version };
}
