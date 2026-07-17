const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultElements = [
    { id: '1', type: 'text', value: '{{CERT_TITLE}}', x: 50, y: 20, fontSize: 48, fontFamily: 'Playfair Display', color: '#1e293b', fontWeight: 'bold', textAlign: 'center', isLocked: true },
    { id: '2', type: 'text', value: 'This is proudly presented to', x: 50, y: 35, fontSize: 18, fontFamily: 'Inter', color: '#64748b', textAlign: 'center' },
    { id: '3', type: 'text', value: '{{STUDENT_NAME}}', x: 50, y: 45, fontSize: 56, fontFamily: 'Cinzel', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    { id: '4', type: 'text', value: 'For successful completion of', x: 50, y: 55, fontSize: 16, fontFamily: 'Inter', color: '#334155', textAlign: 'center' },
    { id: '5', type: 'text', value: '{{COURSE_NAME}}', x: 50, y: 62, fontSize: 24, fontFamily: 'Inter', color: '#1e40af', fontWeight: 'bold', textAlign: 'center' },
    { id: '6', type: 'text', value: 'Date: {{ISSUE_DATE}}', x: 25, y: 80, fontSize: 16, fontFamily: 'Inter', color: '#475569', textAlign: 'center' },
    { id: '7', type: 'text', value: '{{SIGNATURE_1}}', x: 75, y: 76, fontSize: 24, fontFamily: 'Playfair Display', color: '#0f172a', textAlign: 'center' },
    { id: '8', type: 'text', value: 'Authorized Signatory', x: 75, y: 82, fontSize: 14, fontFamily: 'Inter', color: '#475569', textAlign: 'center' },
    { id: '9', type: 'image', value: '{{LOGO}}', x: 50, y: 85, fontSize: 80, zIndex: 1 }
];

const template = {
    name: 'Techwell Premium Live Edition',
    description: 'A premium, fully production-ready certificate template with a high-quality background and relative URLs.',
    purpose: 'Professional Certification',
    orientation: 'HORIZONTAL',
    isDefault: true,
    designUrl: '/certificates/premium-live-bg.png',
    canvasData: JSON.stringify({
        style: {
            borderColor: '#0f172a',
            borderWidth: 0, // Using background image instead
            backgroundColor: '#ffffff',
            orientation: 'HORIZONTAL'
        },
        elements: defaultElements
    })
};

async function seed() {
    console.log('Seeding Premium Live Template...');
    const result = await prisma.certificateTemplate.create({
        data: template
    });
    console.log(`Created live template: ${result.name} (ID: ${result.id})`);
    console.log('Done.');
}

seed()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
