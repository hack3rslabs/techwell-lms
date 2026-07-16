const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Check if Corporate Template already exists
    const existing = await prisma.certificateTemplate.findFirst({
        where: { name: 'Corporate Template' }
    });

    if (!existing) {
        // Set all others to non-default
        await prisma.certificateTemplate.updateMany({
            data: { isDefault: false }
        });

        // Create new corporate template
        await prisma.certificateTemplate.create({
            data: {
                name: 'Corporate Template',
                description: 'The new dynamic React-based corporate template',
                designUrl: 'corporate_v1',
                isDefault: true,
                isActive: true
            }
        });
        console.log("Created Corporate Template!");
    } else {
        await prisma.certificateTemplate.updateMany({
            where: { id: { not: existing.id } },
            data: { isDefault: false }
        });
        await prisma.certificateTemplate.update({
            where: { id: existing.id },
            data: { isDefault: true }
        });
        console.log("Corporate Template already exists and set to default.");
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
