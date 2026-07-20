/**
 * Safely sanitizes a URL string for use in a React href attribute.
 * Only allows URLs starting with http://, https://, mailto:, tel:, or /
 *
 * @param url The URL to sanitize
 * @returns The sanitized URL, or '#' if invalid
 */
export function sanitizeUrl(url?: string | null): string {
    if (!url) return '#';
    const trimmed = url.trim();
    if (!trimmed) return '#';
    
    // Prevent javascript:, data:, and vbscript: URIs
    const allowedProtocols = /^(https?|mailto|tel):/i;
    const isRelative = trimmed.startsWith('/');
    const isFragment = trimmed.startsWith('#');

    if (isRelative || isFragment || allowedProtocols.test(trimmed)) {
        return trimmed;
    }
    
    return '#';
}
