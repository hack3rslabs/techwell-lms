const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultElements = [
    { id: '1', type: 'text', value: '{{INSTITUTE_NAME}}', x: 50, y: 15, fontSize: 24, fontFamily: 'Inter', color: '#1e293b', fontWeight: 'normal', textAlign: 'center', isLocked: true },
    
    { id: '2', type: 'text', value: 'CERTIFICATE OF COMPLETION', x: 50, y: 26, fontSize: 44, fontFamily: 'Playfair Display', color: '#1469E2', fontWeight: 'bold', textAlign: 'center' },
    
    { id: '3', type: 'text', value: 'is hereby awarded to', x: 50, y: 35, fontSize: 18, fontFamily: 'Inter', color: '#64748b', textAlign: 'center' },
    
    { id: '4', type: 'text', value: '{{STUDENT_NAME}}', x: 50, y: 44, fontSize: 56, fontFamily: 'Playfair Display', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    
    { id: 'line_1', type: 'text', value: '________________________________________________', x: 50, y: 47, fontSize: 18, fontFamily: 'Inter', color: '#cbd5e1', textAlign: 'center' },
    
    { id: '5', type: 'text', value: 'for successfully completing the', x: 50, y: 53, fontSize: 18, fontFamily: 'Inter', color: '#64748b', textAlign: 'center' },
    
    { id: '6', type: 'text', value: '{{COURSE_NAME}}', x: 50, y: 60, fontSize: 22, fontFamily: 'Inter', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    
    { id: '7', type: 'text', value: 'Thank you for demonstrating the type of character and integrity that', x: 50, y: 67, fontSize: 16, fontFamily: 'Inter', color: '#475569', textAlign: 'center' },
    { id: '8', type: 'text', value: 'inspire others', x: 50, y: 70, fontSize: 16, fontFamily: 'Inter', color: '#475569', textAlign: 'center' },
    
    { id: '9', type: 'text', value: 'Awarded: {{ISSUE_DATE}}', x: 25, y: 85, fontSize: 16, fontFamily: 'Inter', color: '#334155', textAlign: 'left' },
    
    { id: '10', type: 'text', value: '🎖️', x: 50, y: 83, fontSize: 100, fontFamily: 'Inter', color: '#1469E2', textAlign: 'center' },
    
    { id: '11', type: 'image', value: '{{SIGNATURE_1}}', x: 75, y: 82, fontSize: 80, zIndex: 1 },
    
    { id: 'line_2', type: 'text', value: '__________________________', x: 75, y: 85, fontSize: 16, fontFamily: 'Inter', color: '#cbd5e1', textAlign: 'center' },
    
    { id: '12', type: 'text', value: 'Principal, {{INSTITUTE_NAME}}', x: 75, y: 88, fontSize: 16, fontFamily: 'Inter', color: '#334155', textAlign: 'center' }
];

const template = {
    name: 'Techwell Classic Completion',
    description: 'A classic elegant layout mirroring standard completion certificates, featuring Techwell brand colors.',
    purpose: 'Standard Certification',
    orientation: 'HORIZONTAL',
    isDefault: true,
    designUrl: '/certificates/classic-border.svg',
    canvasData: JSON.stringify({
        style: {
            borderColor: '#1469E2',
            borderWidth: 0,
            backgroundColor: '#ffffff',
            orientation: 'HORIZONTAL'
        },
        elements: defaultElements
    })
};

async function seed() {
    console.log('Seeding Techwell Classic Template...');
    const result = await prisma.certificateTemplate.create({
        data: template
    });
    console.log(`Created classic template: ${result.name} (ID: ${result.id})`);
    console.log('Done.');
}

seed()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
