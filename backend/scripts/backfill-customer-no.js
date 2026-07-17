const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching existing customers...');
  const customers = await prisma.customer.findMany({
    where: { customerNo: null },
    orderBy: { createdAt: 'asc' } // Preserve chronological order
  });

  console.log(`Found ${customers.length} customers needing backfill.`);

  let counter = 1000;
  for (const customer of customers) {
    const customerNo = `CUST-${counter++}`;
    await prisma.customer.update({
      where: { id: customer.id },
      data: { customerNo }
    });
    console.log(`Assigned ${customerNo} to Customer ${customer.id}`);
  }

  console.log('Backfill complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
