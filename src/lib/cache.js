const CACHE_KEY = 'menu_cache';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function saveCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    cachedAt: Date.now(),
    ...data, // { items, categories }
  }));
}

export function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw); // { cachedAt, items, categories }
  } catch {
    return null;
  }
}

export function isCacheFresh(cache) {
  return cache && (Date.now() - cache.cachedAt) < TTL_MS;
}
