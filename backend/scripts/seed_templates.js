const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultElements = [
    { id: '1', type: 'text', value: '{{CERT_TITLE}}', x: 50, y: 25, fontSize: 48, fontFamily: 'Playfair Display', color: '#1e293b', fontWeight: 'bold', textAlign: 'center', isLocked: true },
    { id: '2', type: 'text', value: 'This is proudly presented to', x: 50, y: 35, fontSize: 18, fontFamily: 'Inter', color: '#64748b', textAlign: 'center' },
    { id: '3', type: 'text', value: '{{STUDENT_NAME}}', x: 50, y: 45, fontSize: 56, fontFamily: 'Cinzel', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    { id: '4', type: 'text', value: 'For successful completion of {{COURSE_NAME}}', x: 50, y: 58, fontSize: 20, fontFamily: 'Inter', color: '#334155', textAlign: 'center' },
    { id: '5', type: 'text', value: 'Date: {{ISSUE_DATE}}', x: 20, y: 75, fontSize: 16, fontFamily: 'Inter', color: '#475569', textAlign: 'left' },
    { id: '6', type: 'text', value: '{{SIGNATURE_1}}', x: 80, y: 72, fontSize: 24, fontFamily: 'Playfair Display', color: '#0f172a', textAlign: 'center' },
    { id: '7', type: 'text', value: 'Authorized Signatory', x: 80, y: 78, fontSize: 14, fontFamily: 'Inter', color: '#475569', textAlign: 'center' },
    { id: '8', type: 'image', value: '{{LOGO}}', x: 50, y: 12, fontSize: 80, zIndex: 1 },
    { id: '9', type: 'image', value: '{{STAMP}}', x: 50, y: 80, fontSize: 80, zIndex: 2 }
];

const templates = [
    {
        name: 'Corporate Blue Professional',
        description: 'A modern, authoritative design suitable for corporate IT and business certifications.',
        purpose: 'Professional Certification',
        orientation: 'HORIZONTAL',
        isDefault: true,
        designUrl: '',
        canvasData: JSON.stringify({
            style: {
                borderColor: '#1e3a8a', // Dark blue
                borderWidth: 20,
                backgroundColor: '#ffffff',
                orientation: 'HORIZONTAL'
            },
            elements: defaultElements.map(e => e.id === '1' ? { ...e, color: '#1e3a8a' } : e)
        })
    },
    {
        name: 'Premium Gold Excellence',
        description: 'Luxurious gold-themed certificate for awards and high-level achievements.',
        purpose: 'Excellence Award',
        orientation: 'HORIZONTAL',
        isDefault: true,
        designUrl: '',
        canvasData: JSON.stringify({
            style: {
                borderColor: '#b45309', // Dark gold
                borderWidth: 15,
                backgroundColor: '#fffbeb', // Light amber background
                orientation: 'HORIZONTAL'
            },
            elements: defaultElements.map(e => e.id === '1' ? { ...e, color: '#b45309', fontFamily: 'Cinzel' } : e)
        })
    },
    {
        name: 'Academic Minimalist',
        description: 'Clean, elegant, white-space heavy design for university or formal academic use.',
        purpose: 'Course Completion Certificate',
        orientation: 'HORIZONTAL',
        isDefault: true,
        designUrl: '',
        canvasData: JSON.stringify({
            style: {
                borderColor: '#000000',
                borderWidth: 2,
                backgroundColor: '#ffffff',
                orientation: 'HORIZONTAL'
            },
            elements: defaultElements.map(e => e.fontFamily === 'Cinzel' ? { ...e, fontFamily: 'Playfair Display' } : e)
        })
    },
    {
        name: 'Cyber Security Shield',
        description: 'Dark-themed, high-tech layout for technical assessments.',
        purpose: 'Cyber Security Certification',
        orientation: 'HORIZONTAL',
        isDefault: true,
        designUrl: '',
        canvasData: JSON.stringify({
            style: {
                borderColor: '#10b981', // Emerald green
                borderWidth: 10,
                backgroundColor: '#0f172a', // Slate 900
                orientation: 'HORIZONTAL'
            },
            elements: defaultElements.map(e => ({ ...e, color: e.color ? (e.color.startsWith('#0') || e.color.startsWith('#1') || e.color.startsWith('#3') ? '#f8fafc' : '#94a3b8') : undefined }))
        })
    },
    {
        name: 'AI Bootcamp Vertical',
        description: 'A modern portrait layout for bootcamp participation.',
        purpose: 'AI Certification',
        orientation: 'VERTICAL',
        isDefault: true,
        designUrl: '',
        canvasData: JSON.stringify({
            style: {
                borderColor: '#6366f1', // Indigo
                borderWidth: 12,
                backgroundColor: '#ffffff',
                orientation: 'VERTICAL'
            },
            elements: defaultElements.map(e => {
                // Adjust Y positions for vertical layout
                const y = e.y * 1.4; // roughly scale down
                return { ...e, y: Math.min(y, 90) };
            })
        })
    }
];

async function seed() {
    console.log('Seeding premium templates...');
    for (const t of templates) {
        await prisma.certificateTemplate.create({
            data: {
                name: t.name,
                description: t.description,
                purpose: t.purpose,
                orientation: t.orientation,
                isDefault: t.isDefault,
                designUrl: t.designUrl,
                canvasData: t.canvasData
            }
        });
        console.log(`Created template: ${t.name}`);
    }
    console.log('Done seeding.');
}

seed()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
