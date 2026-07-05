const dns = require('dns');
const { URL } = require('url');

/**
 * Validates if a URL is safe from Server-Side Request Forgery (SSRF)
 * by blocking local/private IP ranges and localhost hostnames.
 */
async function isSafeWebhookUrl(inputUrl) {
    try {
        const parsed = new URL(inputUrl);
        
        // Only allow HTTP/HTTPS
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return false;
        }

        const hostname = parsed.hostname;
        
        // Block obvious local names
        const blockedNames = ['localhost', 'metadata.google.internal', '169.254.169.254'];
        if (blockedNames.includes(hostname)) {
            return false;
        }

        // Resolve DNS
        const addresses = await new Promise((resolve, reject) => {
            dns.lookup(hostname, { all: true }, (err, addresses) => {
                if (err) resolve([]);
                else resolve(addresses.map(a => a.address));
            });
        });

        if (addresses.length === 0) return false;

        for (const ip of addresses) {
            // Very basic IPv4 private block checking
            const parts = ip.split('.').map(Number);
            if (parts.length === 4) {
                if (
                    parts[0] === 127 || // Loopback
                    parts[0] === 10 || // Class A private
                    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // Class B private
                    (parts[0] === 192 && parts[1] === 168) || // Class C private
                    (parts[0] === 169 && parts[1] === 254) // Link-local
                ) {
                    return false;
                }
            }
            // Add basic IPv6 checks if necessary
            if (ip === '::1' || ip.toLowerCase().startsWith('fc00:') || ip.toLowerCase().startsWith('fd00:') || ip.toLowerCase().startsWith('fe80:')) {
                return false;
            }
        }
        
        return true;
    } catch (error) {
        return false; // Malformed URL
    }
}

module.exports = { isSafeWebhookUrl };
