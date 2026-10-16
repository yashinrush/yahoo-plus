/**
 * In-Memory TTL Cache Service
 * 
 * Provides high-performance in-memory caching with Time-To-Live (TTL) expiration,
 * periodic cleanup, and telemetry observability (hits, misses, ratio).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  keysCount: number;
  hitRatio: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private hits = 0;
  private misses = 0;
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs = 60000) {
    // Periodically evict expired entries to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.evictExpired();
    }, cleanupIntervalMs);
    // Unref so this interval does not keep the Node process running on shutdown
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Get an item from cache by key. Returns null if expired or not found.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Set an item in cache with a TTL in seconds.
   */
  set<T>(key: string, value: T, ttlSeconds = 300): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Remove a specific key from cache.
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items in cache and reset statistics.
   */
  flush(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Evict all expired entries.
   */
  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Return telemetry metrics for monitoring.
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRatio = totalRequests > 0 ? Number(((this.hits / totalRequests) * 100).toFixed(1)) : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      keysCount: this.cache.size,
      hitRatio,
    };
  }
}

// Singleton cache instance for application-wide reuse
export const appCache = new CacheService();
