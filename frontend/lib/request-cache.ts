// Request deduplication utility - prevents duplicate simultaneous requests
// If the same request is made before the first one completes, reuse its response

interface CacheEntry<T> {
    promise: Promise<T>
    timestamp: number
}

const requestCache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL = 5000 // 5 seconds - prevent immediate duplicate requests

export function getCacheKey(url: string, params?: Record<string, unknown>): string {
    const paramStr = params ? JSON.stringify(params) : ''
    return `${url}:${paramStr}`
}

export function getDedupedRequest<T>(
    key: string,
    requestFn: () => Promise<T>
): Promise<T> {
    const now = Date.now()
    const cached = requestCache.get(key)

    // Return existing promise if still fresh
    if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.promise as Promise<T>
    }

    // Clean up expired entries
    if (cached && now - cached.timestamp >= CACHE_TTL) {
        requestCache.delete(key)
    }

    // Make new request
    const promise = requestFn().finally(() => {
        // Clear cache after request completes
        setTimeout(() => requestCache.delete(key), 100)
    })

    requestCache.set(key, { promise, timestamp: now })
    return promise
}

export function clearRequestCache(): void {
    requestCache.clear()
}
