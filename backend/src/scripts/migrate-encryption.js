const { PrismaClient } = require('@prisma/client');
const { encrypt } = require('../utils/encryption');
require('dotenv').config();

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const SENSITIVE_FIELDS = [
    'razorpayKeySecret',
    'smtpPassword',
    'zoomClientSecret',
    'anthropicApiKey',
    'googleMeetApiKey',
    'msTeamsClientSecret',
    'n8nAuthToken',
    'openaiApiKey',
    'paypalSecretKey',
    'stripeSecretKey',
    'twilioAuthToken',
    'whatsappApiToken',
    'webhookSecret'
];

async function migrateEncryption() {
    console.log('Starting encryption migration...');
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: 'default' }
        });

        if (!settings) {
            console.log('No settings found. Skipping migration.');
            return;
        }

        let updated = false;
        const dataToUpdate = {};

        SENSITIVE_FIELDS.forEach(field => {
            const val = settings[field];
            if (val && !val.includes(':')) { // Assumes encrypted values contain ':' (IV:Tag:EncryptedData)
                dataToUpdate[field] = encrypt(val);
                updated = true;
                console.log(`Encrypting field: ${field}`);
            }
        });

        if (updated) {
            await prisma.systemSettings.update({
                where: { id: 'default' },
                data: dataToUpdate
            });
            console.log('Successfully encrypted existing settings.');
        } else {
            console.log('No fields required encryption. They are either empty or already encrypted.');
        }

        // Migrate users' 2FA secrets
        console.log('Checking for plaintext 2FA secrets...');
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { twoFactorSecret: { not: null } },
                    { twoFactorTempSecret: { not: null } }
                ]
            }
        });

        let usersUpdated = 0;
        for (const user of users) {
            const updateData = {};
            if (user.twoFactorSecret && !user.twoFactorSecret.includes(':')) {
                updateData.twoFactorSecret = encrypt(user.twoFactorSecret);
            }
            if (user.twoFactorTempSecret && !user.twoFactorTempSecret.includes(':')) {
                updateData.twoFactorTempSecret = encrypt(user.twoFactorTempSecret);
            }

            if (Object.keys(updateData).length > 0) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: updateData
                });
                usersUpdated++;
            }
        }
        
        console.log(`Successfully encrypted 2FA secrets for ${usersUpdated} users.`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateEncryption();
