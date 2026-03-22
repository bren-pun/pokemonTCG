const CACHE_KEY = "pokemonCardCache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_TTL) return null;
    return cache.data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // storage full — ignore
  }
}

/** Merged pool of cached cards grouped by rarity */
export function getCachedPool() {
  return getCache();
}

export function saveCachedPool(pool) {
  setCache(pool);
}
