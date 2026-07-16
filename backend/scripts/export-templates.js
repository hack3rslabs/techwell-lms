const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function exportTemplates() {
    console.log('Exporting certificate templates...');
    const templates = await prisma.certificateTemplate.findMany({
        select: {
            name: true,
            description: true,
            designUrl: true,
            previewUrl: true,
            isDefault: true,
            isActive: true,
            canvasData: true,
        }
    });

    const outputPath = path.join(__dirname, '../prisma/templates.json');
    fs.writeFileSync(outputPath, JSON.stringify(templates, null, 2));
    console.log(`✅ Successfully exported ${templates.length} templates to prisma/templates.json`);
    console.log('You can now commit this file to git to include your templates in the build code.');
}

exportTemplates()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
