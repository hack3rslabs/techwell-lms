/**
 * Utility to get full image URL from relative path
 * Handles both external URLs and local uploads
 */

export const getFullImageUrl = (path?: string | null): string => {
    if (!path) return "";

    // Handle full URLs (http or https)
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // Handle protocol-relative URLs (e.g., //example.com/image.png)
    if (path.startsWith("//")) {
        return `https:${path}`;
    }

    const envApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    // Dynamic Resolution: If we are in the browser and the current hostname 
    // is NOT localhost (e.g., an IP address), replace localhost in the API URL 
    // with the current hostname to ensure images load correctly from secondary devices.
    let apiUrl = envApiUrl;
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && apiUrl.includes('localhost')) {
        apiUrl = apiUrl.replace('localhost', window.location.hostname);
    }

    // Remove /api if present at the end
    const baseUrl = apiUrl.replace(/\/api\/?$/, "");

    // Ensure path starts with a slash
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    // Join baseUrl and path, ensuring no double slashes except for protocol
    const fullUrl = `${baseUrl}${normalizedPath}`.replace(/([^:]\/)\/+/g, "$1");

    return fullUrl;
};