const FAVORITES_STORAGE_KEY = 'favorite_poems';

function sanitizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
}

export function getFavoritePoemIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    return sanitizeIds(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function setFavoritePoemIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(sanitizeIds(ids)));
  } catch {
    /* ignore */
  }
}

export function toggleFavoritePoemId(id: string): string[] {
  const current = getFavoritePoemIds();
  const exists = current.includes(id);
  const next = exists ? current.filter((item) => item !== id) : [...current, id];
  setFavoritePoemIds(next);
  return next;
}

export function isFavoritePoemId(id: string, ids?: string[]): boolean {
  const list = ids ?? getFavoritePoemIds();
  return list.includes(id);
}
