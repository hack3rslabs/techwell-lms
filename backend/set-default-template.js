const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Set all templates to isDefault: false
    await prisma.certificateTemplate.updateMany({
        where: {},
        data: { isDefault: false }
    });

    // Find the latest Corporate template and set it to default
    const corporateTemplate = await prisma.certificateTemplate.findFirst({
        where: { name: 'Techwell Corporate Edition' },
        orderBy: { createdAt: 'desc' }
    });

    if (corporateTemplate) {
        await prisma.certificateTemplate.update({
            where: { id: corporateTemplate.id },
            data: { isDefault: true }
        });
        console.log('Successfully set "Techwell Corporate Edition" as the ONLY default template.');
    } else {
        console.log('Corporate template not found.');
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
