export function formatRuntimeMinutes(runtimeMinutes: number) {
  const safeRuntime = Math.max(runtimeMinutes, 0);
  const hours = Math.floor(safeRuntime / 60);
  const minutes = safeRuntime % 60;

  if (!hours) {
    return `${minutes}min`;
  }

  return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
}

export function formatVotes(votes: number) {
  if (votes >= 1000000) {
    return `${(votes / 1000000).toFixed(1)}M`;
  }

  if (votes >= 1000) {
    return `${(votes / 1000).toFixed(0)}K`;
  }

  return `${votes}`;
}
