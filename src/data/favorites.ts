function storageKey(bookSlug?: string): string {
  return bookSlug ? `favorite_poems_${bookSlug}` : 'favorite_poems';
}

function sanitizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
}

export function getFavoritePoemIds(bookSlug?: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(bookSlug));
    if (!raw) return [];
    return sanitizeIds(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function setFavoritePoemIds(ids: string[], bookSlug?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(bookSlug), JSON.stringify(sanitizeIds(ids)));
  } catch {
    /* ignore */
  }
}

export function toggleFavoritePoemId(id: string, bookSlug?: string): string[] {
  const current = getFavoritePoemIds(bookSlug);
  const exists = current.includes(id);
  const next = exists ? current.filter((item) => item !== id) : [...current, id];
  setFavoritePoemIds(next, bookSlug);
  return next;
}

export function isFavoritePoemId(id: string, ids?: string[]): boolean {
  const list = ids ?? getFavoritePoemIds();
  return list.includes(id);
}
