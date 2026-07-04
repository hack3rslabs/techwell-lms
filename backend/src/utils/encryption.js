const crypto = require('crypto');

// Algorithm: AES-256-GCM (Authenticated Encryption)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const SALT_LENGTH = 64; // Length of salt for key derivation
const TAG_LENGTH = 16; // GCM tag length

// In production, require a strong key. In dev, allow fallback but warn.
const getSecret = () => {
    const secret = process.env.ENCRYPTION_KEY;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: ENCRYPTION_KEY environment variable is not set in production. Cryptographic operations aborted.');
        }
        console.warn('WARNING: Using insecure fallback encryption key. Set ENCRYPTION_KEY in .env');
        return 'techwell-ai-key-fallback-secret-CHANGE_ME_IN_PROD';
    }
    return secret;
};

/**
 * Derives a 32-byte key from the master secret using scrypt.
 */
function getDerivedKey(secret) {
    // Generate a secure key derivation
    return crypto.scryptSync(secret, 'salt', 32);
}

/**
 * Encrypts text using AES-256-GCM
 */
function encrypt(text) {
    if (!text) return null;

    const secret = getSecret();
    const key = getDerivedKey(secret);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: IV:AuthTag:EncryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts text using AES-256-GCM
 */
function decrypt(text) {
    if (!text) return null;

    try {
        const parts = text.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encryption format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const secret = getSecret();
        const key = getDerivedKey(secret);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return text; 
    }
}

module.exports = { encrypt, decrypt };

