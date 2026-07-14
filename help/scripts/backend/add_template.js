const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.certificateTemplate.create({
    data: {
      name: 'Adobe Express Template',
      description: 'Template from Adobe Express URL',
      designUrl: 'https://express.adobe.com/publishedV2/urn:aaid:sc:AP:137ce0c1-3ea4-50ae-912e-50fa0aff7bf8',
      previewUrl: 'https://express.adobe.com/publishedV2/urn:aaid:sc:AP:137ce0c1-3ea4-50ae-912e-50fa0aff7bf8',
      isDefault: false,
      isActive: true,
      layout: null,
      canvasData: JSON.stringify([{"id":"dyn1","type":"text","value":"{{STUDENT_NAME}}","x":50,"y":50,"fontSize":40,"fontFamily":"Arial","color":"#000000"}])
    }
  });
  console.log(t);
}

main().catch(console.error).finally(()=>prisma.$disconnect());
