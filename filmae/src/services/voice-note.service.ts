import { File, Paths } from 'expo-file-system';

const listeners = new Set<() => void>();
let noteVersion = 0;

function noteFile(movieId: string) {
  const safeId = movieId.replace(/[^a-zA-Z0-9_-]/g, '_');

  return new File(Paths.document, `voice-note-${safeId}.m4a`);
}

function notifyChange() {
  noteVersion += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeVoiceNotes(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

// Muda a cada alteração, para o player recarregar quando o áudio for regravado.
export function getVoiceNoteVersion() {
  return noteVersion;
}

export function getVoiceNoteUri(movieId: string): string | null {
  const file = noteFile(movieId);

  return file.exists ? file.uri : null;
}

export async function saveVoiceNote(movieId: string, sourceUri: string) {
  await new File(sourceUri).copy(noteFile(movieId), { overwrite: true });
  notifyChange();
}

export function removeVoiceNote(movieId: string) {
  const file = noteFile(movieId);

  if (file.exists) {
    file.delete();
  }

  notifyChange();
}
