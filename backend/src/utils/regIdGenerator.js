const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function generateRegId() {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `TW-${yearMonth}-`;

    // Find the latest user with this prefix
    const latestUser = await prisma.user.findFirst({
        where: {
            regId: {
                startsWith: prefix
            }
        },
        orderBy: {
            regId: 'desc'
        }
    });

    let nextSequence = 1;
    if (latestUser && latestUser.regId) {
        const lastSequenceStr = latestUser.regId.replace(prefix, '');
        const lastSequence = parseInt(lastSequenceStr, 10);
        if (!isNaN(lastSequence)) {
            nextSequence = lastSequence + 1;
        }
    }

    const regId = `${prefix}${String(nextSequence).padStart(4, '0')}`;
    return regId;
}

module.exports = { generateRegId };
