const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const modernSidebarElements = [
    // Left Sidebar Items
    { id: 'sb1', type: 'image', value: '{{LOGO}}', x: 13, y: 30, fontSize: 100, zIndex: 1 },
    { id: 'sb2', type: 'qr', value: '{{QR_CODE}}', x: 13, y: 70, fontSize: 150, zIndex: 1 },
    
    // Main Content Items (Shifted right)
    { id: '1', type: 'text', value: 'CERTIFICATE', x: 65, y: 20, fontSize: 64, fontFamily: 'Inter', color: '#0f172a', fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
    { id: '2', type: 'text', value: 'OF COMPLETION', x: 65, y: 30, fontSize: 24, fontFamily: 'Inter', color: '#1e293b', fontWeight: 'bold', textAlign: 'center', letterSpacing: 4 },
    { id: '3', type: 'text', value: 'We proudly present this certificate to', x: 65, y: 45, fontSize: 18, fontFamily: 'Inter', color: '#475569', textAlign: 'center' },
    { id: '4', type: 'text', value: '{{STUDENT_NAME}}', x: 65, y: 55, fontSize: 56, fontFamily: 'Inter', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    { id: 'line_1', type: 'text', value: '________________________________________________', x: 65, y: 58, fontSize: 18, fontFamily: 'Inter', color: '#cbd5e1', textAlign: 'center' },
    { id: '5', type: 'text', value: 'honouring completion of the course: "{{COURSE_NAME}}"', x: 65, y: 65, fontSize: 18, fontFamily: 'Inter', color: '#334155', textAlign: 'center' },
    { id: '6', type: 'text', value: 'For the ability to objectively assess the profitability of', x: 65, y: 70, fontSize: 16, fontFamily: 'Inter', color: '#475569', textAlign: 'center' },
    { id: '7', type: 'text', value: 'projects and present products.', x: 65, y: 73, fontSize: 16, fontFamily: 'Inter', color: '#475569', textAlign: 'center' },
    
    // Signatures
    { id: '8', type: 'image', value: '{{SIGNATURE_1}}', x: 45, y: 82, fontSize: 80, zIndex: 1 },
    { id: '9', type: 'text', value: '{{SIGNATORY_NAME}}', x: 45, y: 88, fontSize: 16, fontFamily: 'Inter', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    { id: '10', type: 'text', value: '{{SIGNATORY_TITLE}}', x: 45, y: 91, fontSize: 12, fontFamily: 'Inter', color: '#64748b', textAlign: 'center', textTransform: 'uppercase' },

    { id: '11', type: 'image', value: '{{SIGNATURE_2}}', x: 85, y: 82, fontSize: 80, zIndex: 1 },
    { id: '12', type: 'text', value: '{{TRAINER_NAME}}', x: 85, y: 88, fontSize: 16, fontFamily: 'Inter', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    { id: '13', type: 'text', value: 'COURSE INSTRUCTOR', x: 85, y: 91, fontSize: 12, fontFamily: 'Inter', color: '#64748b', textAlign: 'center', textTransform: 'uppercase' },
    
    // Stamp/Badge
    { id: '14', type: 'image', value: '{{STAMP}}', x: 85, y: 25, fontSize: 120, zIndex: 1 }
];


const gradientBarsElements = [
    { id: '1', type: 'text', value: 'GRADUATION CERTIFICATE', x: 50, y: 20, fontSize: 44, fontFamily: 'Inter', color: '#1469E2', fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 },
    { id: '2', type: 'text', value: '{{INSTITUTE_NAME}}', x: 50, y: 28, fontSize: 20, fontFamily: 'Inter', color: '#334155', fontWeight: 'normal', textAlign: 'center', letterSpacing: 4, textTransform: 'uppercase' },
    { id: '3', type: 'text', value: 'THIS CERTIFICATE IS AWARDED TO', x: 50, y: 40, fontSize: 14, fontFamily: 'Inter', color: '#64748b', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
    { id: '4', type: 'text', value: '{{STUDENT_NAME}}', x: 50, y: 52, fontSize: 64, fontFamily: 'Playfair Display', color: '#0f172a', fontWeight: 'normal', textAlign: 'center' },
    { id: 'line_1', type: 'text', value: '________________________________________________', x: 50, y: 55, fontSize: 18, fontFamily: 'Inter', color: '#cbd5e1', textAlign: 'center' },
    
    { id: '5', type: 'text', value: 'For successfully completing the comprehensive training program in', x: 50, y: 65, fontSize: 16, fontFamily: 'Inter', color: '#475569', textAlign: 'center' },
    { id: '6', type: 'text', value: '{{COURSE_NAME}}', x: 50, y: 69, fontSize: 20, fontFamily: 'Inter', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    
    { id: '7', type: 'text', value: '{{INSTITUTE_NAME}} wishes them all the best.', x: 50, y: 76, fontSize: 14, fontFamily: 'Inter', color: '#475569', textAlign: 'center', textTransform: 'uppercase' },

    // Signatures
    { id: '8', type: 'image', value: '{{SIGNATURE_1}}', x: 25, y: 85, fontSize: 80, zIndex: 1 },
    { id: '9', type: 'text', value: '_______________________', x: 25, y: 88, fontSize: 16, fontFamily: 'Inter', color: '#94a3b8', textAlign: 'center' },
    { id: '10', type: 'text', value: '{{SIGNATORY_NAME}}', x: 25, y: 92, fontSize: 14, fontFamily: 'Inter', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    { id: '11', type: 'text', value: '{{SIGNATORY_TITLE}}', x: 25, y: 95, fontSize: 12, fontFamily: 'Inter', color: '#64748b', textAlign: 'center', textTransform: 'uppercase' },

    { id: '12', type: 'image', value: '{{SIGNATURE_2}}', x: 75, y: 85, fontSize: 80, zIndex: 1 },
    { id: '13', type: 'text', value: '_______________________', x: 75, y: 88, fontSize: 16, fontFamily: 'Inter', color: '#94a3b8', textAlign: 'center' },
    { id: '14', type: 'text', value: '{{TRAINER_NAME}}', x: 75, y: 92, fontSize: 14, fontFamily: 'Inter', color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
    { id: '15', type: 'text', value: 'COURSE INSTRUCTOR', x: 75, y: 95, fontSize: 12, fontFamily: 'Inter', color: '#64748b', textAlign: 'center', textTransform: 'uppercase' },

    // Badge
    { id: '16', type: 'image', value: '{{STAMP}}', x: 50, y: 88, fontSize: 80, zIndex: 1 }
];


async function seed() {
    console.log('Seeding Modern Templates...');
    
    await prisma.certificateTemplate.create({
        data: {
            name: 'Techwell Modern Sidebar',
            description: 'A striking modern design with a dark left sidebar for logos and QR codes.',
            purpose: 'Professional Certification',
            orientation: 'HORIZONTAL',
            isDefault: true,
            designUrl: '/certificates/modern-sidebar-bg.svg',
            canvasData: JSON.stringify({
                style: { borderColor: '#1469E2', borderWidth: 0, backgroundColor: '#ffffff', orientation: 'HORIZONTAL' },
                elements: modernSidebarElements
            })
        }
    });

    await prisma.certificateTemplate.create({
        data: {
            name: 'Techwell Minimal Gradient',
            description: 'A clean, minimal layout featuring a bold gradient bar across the top and bottom.',
            purpose: 'Professional Certification',
            orientation: 'HORIZONTAL',
            isDefault: true,
            designUrl: '/certificates/gradient-bars-bg.svg',
            canvasData: JSON.stringify({
                style: { borderColor: '#1469E2', borderWidth: 0, backgroundColor: '#ffffff', orientation: 'HORIZONTAL' },
                elements: gradientBarsElements
            })
        }
    });

    console.log('Done creating 2 new templates.');
}

seed()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
