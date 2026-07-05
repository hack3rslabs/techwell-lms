const { PrismaClient } = require('./backend/node_modules/@prisma/client'); 
const prisma = new PrismaClient(); 

async function seed() { 
    await prisma.certificateTemplate.create({ data: { name: 'Classic Blue', description: 'Standard professional template', designUrl: 'CLASSIC_BLUE', isDefault: true, isActive: true }}); 
    await prisma.certificateTemplate.create({ data: { name: 'Rich Gold', description: 'Premium template with gold accents', designUrl: 'RICH_GOLD', isDefault: false, isActive: true }}); 
    await prisma.certificateTemplate.create({ data: { name: 'Professional Slate', description: 'Minimalist dark slate design', designUrl: 'PROFESSIONAL_SLATE', isDefault: false, isActive: true }}); 
    console.log('Seeded templates'); 
} 

seed().finally(() => prisma.$disconnect());
