const { generateSecret, verify, generateURI } = require('otplib');
const qrcode = require('qrcode');
const crypto = require('crypto');

/**
 * Generates a random Base32 TOTP secret.
 * @returns {string} Base32 secret key.
 */
function generateSecretKey() {
    return generateSecret();
}

/**
 * Generates an OTPAuth URI (otpauth://totp/...)
 * @param {string} email - The user's email address.
 * @param {string} secret - The Base32 TOTP secret.
 * @returns {string} The OTPAuth URI.
 */
function generateOtpauthUri(email, secret) {
    return generateURI({
        secret,
        label: email,
        issuer: 'Techwell LMS'
    });
}

/**
 * Renders an OTPAuth URI as a Data URL containing a PNG QR code.
 * @param {string} otpauthUri - The OTPAuth URI.
 * @returns {Promise<string>} Base64 data URL.
 */
async function generateQrCodeUrl(otpauthUri) {
    try {
        return await qrcode.toDataURL(otpauthUri);
    } catch (error) {
        console.error('Error generating QR code data URL:', error);
        throw new Error('Failed to generate 2FA QR code');
    }
}

/**
 * Verifies a 6-digit TOTP token against the secret.
 * @param {string} token - The 6-digit verification code.
 * @param {string} secret - The Base32 TOTP secret.
 * @returns {Promise<boolean>} True if token is valid, false otherwise.
 */
async function verifyToken(token, secret) {
    if (!token || !secret) return false;
    try {
        const result = await verify({ token, secret, window: 1 });
        return !!result.valid;
    } catch (error) {
        console.error('Error verifying TOTP token:', error);
        return false;
    }
}

/**
 * Generates a random trust token for device authorization.
 * @returns {string} Hexadecimal trust token.
 */
function generateTrustToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a SHA-256 hash of a trust token.
 * @param {string} token - The plain text token.
 * @returns {string} Hashed token.
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Future Hook: Sends secure email notification upon 2FA login/changes.
 * @param {object} user - The user object.
 */
async function sendFutureBackupMailConfirmation(user) {
    console.log(`[Future Hook] Secure verification email triggered for: ${user.email}`);
    // Future expansion will connect to existing backend/src/services/email.service.js
}

/**
 * Future Hook: Sends secure SMS OTP/alert upon 2FA login/changes.
 * @param {object} user - The user object.
 */
async function sendFutureBackupMobileOTP(user) {
    console.log(`[Future Hook] Secure verification SMS triggered for user phone: ${user.phone}`);
    // Future expansion will connect to WhatsApp or mobile SMS gateways
}

module.exports = {
    generateSecret: generateSecretKey,
    generateOtpauthUri,
    generateQrCodeUrl,
    verifyToken,
    generateTrustToken,
    hashToken,
    sendFutureBackupMailConfirmation,
    sendFutureBackupMobileOTP
};
