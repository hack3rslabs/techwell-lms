/**
 * Meeting Service
 * Generates meeting links from configured video integrations.
 * 
 * Supports: ZOOM, GOOGLE_MEET, MS_TEAMS
 * 
 * Mock implementation for V1 - generates placeholder links.
 * Production: Add OAuth flows and actual API calls.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const axios = require('axios');

/**
 * Generate Zoom Access Token using Server-to-Server OAuth
 */
const generateZoomToken = async (accountId, clientId, clientSecret) => {
    try {
        const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await axios.post(tokenUrl, null, {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Zoom Token Error:', error?.response?.data || error.message);
        throw new Error('Failed to generate Zoom access token: ' + JSON.stringify(error?.response?.data || error.message));
    }
};

/**
 * Get the active video integration
 * @returns {Promise<Object|null>} Active integration or null
 */
const getActiveIntegration = async () => {
    return await prisma.videoIntegration.findFirst({
        where: { isActive: true }
    });
};

/**
 * Generate a meeting link based on the configured platform
 * @param {string} scheduledAt - ISO date string for the meeting
 * @param {Object} options - Additional options (title, duration, etc.)
 * @returns {Promise<{platform: string, meetingLink: string}>}
 */
const generateMeetingLink = async (scheduledAt, options = {}) => {
    const integration = await getActiveIntegration();

    // Use integration from DB, or fall back to options.platform + env vars
    const platform = integration?.platform || options.platform || 'MANUAL';
    const apiKey = integration?.apiKey || null;
    const clientId = integration?.clientId || null;
    const clientSecret = integration?.clientSecret || null;

    if (!integration && platform === 'MANUAL') {
        console.log('⚠️ No active video integration found. Using placeholder link.');
        return {
            platform: 'MANUAL',
            meetingLink: null
        };
    }

    const meetingId = generateMeetingId();
    const title = options.title || 'TechWell Interview';
    const duration = options.duration || 30;

    let meetingLink = '';

    switch (platform) {
        case 'ZOOM':
            try {
                const accountId = apiKey || process.env.ZOOM_ACCOUNT_ID;
                const zoomClientId = clientId || process.env.ZOOM_CLIENT_ID;
                const zoomClientSecret = clientSecret || process.env.ZOOM_CLIENT_SECRET;

                if (!accountId || !zoomClientId || !zoomClientSecret) {
                    throw new Error('Zoom credentials (Account ID, Client ID, Client Secret) are missing.');
                }

                const accessToken = await generateZoomToken(accountId, zoomClientId, zoomClientSecret);

                const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
                    topic: title,
                    type: 2, // Scheduled meeting
                    duration: duration,
                    start_time: scheduledAt,
                    settings: {
                        join_before_host: true,
                        jbh_time: 0,
                        mute_upon_entry: true,
                        participant_video: true,
                        host_video: true,
                        waiting_room: true
                    }
                }, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`📹 Generated Real Zoom meeting link: ${response.data.join_url}`);
                
                return {
                    platform: 'ZOOM',
                    meetingLink: response.data.join_url,
                    meetingId: response.data.id.toString(),
                    password: response.data.password
                };

            } catch (error) {
                console.error('Zoom Meeting Creation Error:', error?.response?.data || error.message);
                // Fallback to placeholder if an error happens (e.g. invalid credentials)
                meetingLink = `https://zoom.us/j/${meetingId}?pwd=TechWell${Date.now().toString(36)}`;
                console.log(`⚠️ Falling back to placeholder link: ${meetingLink}`);
            }
            break;

        case 'GOOGLE_MEET':
            // Mock Google Meet link generation
            // Production: Use Google Calendar API with conferenceDataVersion
            const meetCode = generateMeetCode();
            meetingLink = `https://meet.google.com/${meetCode}`;
            console.log(`📹 Generated Google Meet link: ${meetingLink}`);
            break;

        case 'MS_TEAMS':
            // Mock Teams link generation
            // Production: Use Microsoft Graph API - POST /me/onlineMeetings
            meetingLink = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0`;
            console.log(`📹 Generated MS Teams link: ${meetingLink}`);
            break;

        default:
            console.log(`⚠️ Unknown platform: ${platform}. No link generated.`);
            return { platform, meetingLink: null };
    }

    return {
        platform,
        meetingLink
    };
};

/**
 * Generate a random meeting ID (Zoom-style)
 */
const generateMeetingId = () => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
};

/**
 * Generate a Google Meet style code (xxx-xxxx-xxx)
 */
const generateMeetCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const part1 = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part3 = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${part1}-${part2}-${part3}`;
};

module.exports = {
    generateMeetingLink,
    getActiveIntegration
};
