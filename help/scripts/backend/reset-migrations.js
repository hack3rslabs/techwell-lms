const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetMigrations() {
    try {
        console.log('Dropping _prisma_migrations table...');
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "_prisma_migrations";');
        console.log('Table dropped successfully.');
    } catch (err) {
        console.error('Error dropping table:', err);
    } finally {
        await prisma.$disconnect();
    }
}

resetMigrations();
