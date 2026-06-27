const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Update Global Settings
    await prisma.certificateSettings.updateMany({
        data: {
            defaultSignatoryName: "U Purushottama Rao",
            defaultSignatoryTitle: "Course Director"
        }
    });

    // 2. Update existing Certificates
    await prisma.certificate.updateMany({
        data: {
            signatoryName: "U Purushottama Rao",
            signatoryTitle: "Course Director"
        }
    });

    console.log("Successfully updated signatory details in the database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
