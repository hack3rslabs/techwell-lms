const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find a customer
  let customer = await prisma.customer.findFirst();
  
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '1234567890'
      }
    });
  }

  // Create a sample agreement
  const agreement = await prisma.clientAgreement.create({
    data: {
      agreementNum: `TW-AGR-TEST-${Date.now()}`,
      customerId: customer.id,
      vertical: 'Consultancy',
      title: 'Consultancy Retainer Agreement',
      content: `<h2>Consultancy Services Agreement</h2>
      <p>This agreement outlines the consulting services provided to the client. The client agrees to the terms and conditions set forth by Techwell.</p>
      <ul>
        <li>Monthly Retainer: ₹50,000</li>
        <li>SLA: 24 Hour Response Time</li>
      </ul>
      <p>Please review and sign below to execute the contract.</p>`,
      totalValue: 50000,
      taxPercentage: 18,
      taxAmount: 9000,
      grandTotal: 59000,
      status: 'SENT'
    }
  });

  console.log(`\n================================`);
  console.log(`✅ Sample Agreement Created!`);
  console.log(`🔗 SHARE LINK: http://localhost:3000/agreements/${agreement.id}`);
  console.log(`================================\n`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
