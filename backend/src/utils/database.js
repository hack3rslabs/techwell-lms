const { PrismaClient } = require('@prisma/client');

const prisma =
    global.__techwellPrisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });

if (process.env.NODE_ENV !== 'production') {
    global.__techwellPrisma = prisma;
}

const DATABASE_HELP =
    "Database is offline. Start the PostgreSQL Windows service 'postgresql-x64-18' and make sure localhost:5432 is available.";

function isDatabaseOfflineError(error) {
    return (
        error?.code === 'P1001' ||
        /Can't reach database server/i.test(error?.message || '')
    );
}

async function getDatabaseHealth() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { ok: true };
    } catch (error) {
        return {
            ok: false,
            error,
            message: isDatabaseOfflineError(error)
                ? DATABASE_HELP
                : error?.message || 'Database check failed.'
        };
    }
}

module.exports = {
    prisma,
    DATABASE_HELP,
    getDatabaseHealth,
    isDatabaseOfflineError
};
