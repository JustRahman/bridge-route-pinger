// In-memory cache for bridge routes
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

/**
 * Generate cache key from request parameters
 * @param {string} token - Token symbol
 * @param {number} amount - Amount to bridge
 * @param {string} fromChain - Source chain
 * @param {string} toChain - Destination chain
 * @returns {string} Cache key
 */
export function getCacheKey(token, amount, fromChain, toChain) {
  return `${token}-${amount}-${fromChain}-${toChain}`;
}

/**
 * Get cached data if available and not expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if not found/expired
 */
export function getCache(key) {
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  const age = Date.now() - cached.timestamp;

  if (age > CACHE_TTL) {
    // Expired, remove from cache
    cache.delete(key);
    return null;
  }

  console.log(`Cache hit for key: ${key} (age: ${Math.round(age / 1000)}s)`);
  return cached.data;
}

/**
 * Set cache data with timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });

  console.log(`Cached data for key: ${key}`);

  // Cleanup old entries
  cleanupCache();
}

/**
 * Clear all cache entries
 */
export function clearCache() {
  cache.clear();
  console.log('Cache cleared');
}

/**
 * Remove expired cache entries
 */
function cleanupCache() {
  const now = Date.now();
  let removedCount = 0;

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    console.log(`Cleaned up ${removedCount} expired cache entries`);
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export function getCacheStats() {
  return {
    size: cache.size,
    ttl_seconds: CACHE_TTL / 1000
  };
}
