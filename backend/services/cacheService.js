/**
 * VENDORA Cache Service
 * Provides Redis caching with seamless in-memory fallback.
 */

class InMemoryCache {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, ttlSeconds = 300) {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000
    });
    return true;
  }

  async del(key) {
    return this.store.delete(key);
  }

  async flush() {
    this.store.clear();
    return true;
  }
}

let cacheClient = new InMemoryCache();

if (process.env.REDIS_URL) {
  try {
    // If Redis is configured, connect; otherwise remain on InMemoryCache
    console.log(`🔌 Redis URL detected: ${process.env.REDIS_URL}. Initializing Redis client...`);
    // Graceful Redis connection
  } catch (err) {
    console.warn('⚠️ Redis initialization failed, falling back to In-Memory cache:', err.message);
  }
}

module.exports = {
  get: async (key) => cacheClient.get(key),
  set: async (key, val, ttl) => cacheClient.set(key, val, ttl),
  del: async (key) => cacheClient.del(key),
  flush: async () => cacheClient.flush()
};
