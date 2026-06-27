/**
 * In-Memory High-Performance Caching Service
 * Supports TTL (Time-To-Live), maximum entry bounds, and automatic pruning.
 * Zero-dependency caching solution to avoid platform-dependent module issues.
 */

class CacheService {
    constructor(maxSize = 1000, defaultTtlMs = 5 * 60 * 1000) {
        this.store = new Map();
        this.maxSize = maxSize;
        this.defaultTtlMs = defaultTtlMs;
        
        // Background pruning every 60 seconds
        this.pruningInterval = setInterval(() => this.prune(), 60 * 1000);
        if (this.pruningInterval.unref) {
            this.pruningInterval.unref(); // Prevent blocking process termination
        }
    }

    /**
     * Set cache entry
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttlMs - TTL in milliseconds 
     */
    set(key, value, ttlMs = this.defaultTtlMs) {
        if (this.store.size >= this.maxSize) {
            // Evict oldest item (FIFO / Map keys order)
            const oldestKey = this.store.keys().next().value;
            if (oldestKey) this.store.delete(oldestKey);
        }

        const expiresAt = Date.now() + ttlMs;
        this.store.set(key, { value, expiresAt });
    }

    /**
     * Get cache entry
     * @param {string} key 
     * @returns {any|null}
     */
    get(key) {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key); // Stale entry
            return null;
        }

        return entry.value;
    }

    /**
     * Delete cache entry
     * @param {string} key 
     */
    del(key) {
        this.store.delete(key);
    }

    /**
     * Delete all entries matching a regex or prefix
     * @param {string|RegExp} pattern 
     */
    invalidate(pattern) {
        const isRegex = pattern instanceof RegExp;
        for (const key of this.store.keys()) {
            const matches = isRegex ? pattern.test(key) : key.startsWith(pattern);
            if (matches) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Flush all cache entries
     */
    flush() {
        this.store.clear();
    }

    /**
     * Remove expired keys to free memory
     */
    prune() {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Express Middleware creator for caching GET requests
     * @param {string} cachePrefix - Namespace prefix, e.g. "courses:" or "products:"
     * @param {number} ttlMs - Cache lifetime in milliseconds
     */
    middleware(cachePrefix, ttlMs = this.defaultTtlMs) {
        return (req, res, next) => {
            // Only cache GET requests
            if (req.method !== 'GET') {
                return next();
            }

            // Create unique cache key based on URL and user role (if logged in, to respect visibility checks)
            const userId = req.user ? req.user.id : 'guest';
            const userRole = req.user ? req.user.role : 'public';
            const cacheKey = `${cachePrefix}:${req.originalUrl || req.url}:${userId}:${userRole}`;

            const cachedPayload = this.get(cacheKey);
            if (cachedPayload) {
                console.log(`[CACHE HIT] Key: ${cacheKey}`);
                return res.json(cachedPayload);
            }

            console.log(`[CACHE MISS] Key: ${cacheKey}`);
            
            // Intercept res.json to capture response payload
            const originalJson = res.json;
            res.json = (body) => {
                // If it is a successful status code, cache it
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    this.set(cacheKey, body, ttlMs);
                }
                return originalJson.call(res, body);
            };

            next();
        };
    }
}

// Export single singleton instance
const globalCache = new CacheService();
module.exports = globalCache;
