export function sanitizeUrl(url: string | undefined | null): string {
    if (!url) return '#';
    try {
        // If it's a relative URL, it's generally safe for XSS (assuming it doesn't start with javascript: or data:)
        if (url.startsWith('/')) return url;
        
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (['http:', 'https:'].includes(parsed.protocol)) {
            return url;
        }
        return '#';
    } catch {
        // If URL parsing fails, check if it's a safe relative path
        if (url.startsWith('/')) return url;
        return '#';
    }
}
