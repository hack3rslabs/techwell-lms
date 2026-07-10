const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const THEMES = {
    GOLD: { primary: '#b45309', secondary: '#92400e', border: '#fcd34d' },
    SLATE: { primary: '#0f172a', secondary: '#1e293b', border: '#334155' },
    BLUE: { primary: '#1d4ed8', secondary: '#1e3a8a', border: '#60a5fa' },
    EMERALD: { primary: '#047857', secondary: '#064e3b', border: '#34d399' },
    ROSE: { primary: '#be123c', secondary: '#881337', border: '#fb7185' },
    SILVER: { primary: '#374151', secondary: '#111827', border: '#9ca3af' },
};

function generateCanvasData(title, theme, isPortrait) {
    const elements = [];
    
    // Background watermark
    elements.push({
        id: Date.now().toString() + Math.random(), type: "image", value: "{{WATERMARK}}",
        x: 50, y: 50, fontSize: 300, color: "#f1f5f9", zIndex: 1, isLocked: true
    });

    // Top Header Pattern or Logo
    elements.push({
        id: Date.now().toString() + Math.random(), type: "image", value: "{{LOGO}}",
        x: 50, y: isPortrait ? 12 : 15, fontSize: 80, zIndex: 2
    });

    // Certificate Title
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: title.toUpperCase(),
        x: 50, y: isPortrait ? 25 : 28, fontSize: isPortrait ? 36 : 48, fontFamily: "Playfair Display",
        color: theme.primary, fontWeight: "900", letterSpacing: 4, textAlign: "center", zIndex: 2
    });

    // Subtitle
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "THIS IS PROUDLY PRESENTED TO",
        x: 50, y: isPortrait ? 33 : 38, fontSize: 16, fontFamily: "Montserrat",
        color: "#64748b", fontWeight: "bold", letterSpacing: 3, textAlign: "center", zIndex: 2
    });

    // Student Name
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "{{STUDENT_NAME}}",
        x: 50, y: isPortrait ? 42 : 48, fontSize: isPortrait ? 48 : 56, fontFamily: "Cinzel",
        color: theme.secondary, fontWeight: "bold", letterSpacing: 1, textAlign: "center", zIndex: 2
    });

    // Description text
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "for successfully completing the program in",
        x: 50, y: isPortrait ? 50 : 56, fontSize: 18, fontFamily: "Inter",
        color: "#475569", fontWeight: "normal", letterSpacing: 0, textAlign: "center", zIndex: 2
    });

    // Course Name
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "{{COURSE_NAME}}",
        x: 50, y: isPortrait ? 56 : 62, fontSize: 24, fontFamily: "Montserrat",
        color: theme.primary, fontWeight: "bold", letterSpacing: 1, textAlign: "center", zIndex: 2
    });

    // Signatures Area
    // Signature 1
    elements.push({
        id: Date.now().toString() + Math.random(), type: "image", value: "{{SIGNATURE_1}}",
        x: isPortrait ? 30 : 25, y: isPortrait ? 72 : 78, fontSize: 80, zIndex: 2
    });
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "___________________",
        x: isPortrait ? 30 : 25, y: isPortrait ? 78 : 83, fontSize: 18, color: "#cbd5e1", zIndex: 2
    });
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "AUTHORIZED SIGNATORY",
        x: isPortrait ? 30 : 25, y: isPortrait ? 81 : 86, fontSize: 12, fontFamily: "Inter",
        color: "#64748b", fontWeight: "bold", letterSpacing: 2, zIndex: 2
    });

    // Digital Stamp / Seal (Center)
    elements.push({
        id: Date.now().toString() + Math.random(), type: "image", value: "{{STAMP}}",
        x: 50, y: isPortrait ? 75 : 80, fontSize: 80, zIndex: 2
    });

    // Signature 2
    elements.push({
        id: Date.now().toString() + Math.random(), type: "image", value: "{{SIGNATURE_2}}",
        x: isPortrait ? 70 : 75, y: isPortrait ? 72 : 78, fontSize: 80, zIndex: 2
    });
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "___________________",
        x: isPortrait ? 70 : 75, y: isPortrait ? 78 : 83, fontSize: 18, color: "#cbd5e1", zIndex: 2
    });
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "INSTITUTE DIRECTOR",
        x: isPortrait ? 70 : 75, y: isPortrait ? 81 : 86, fontSize: 12, fontFamily: "Inter",
        color: "#64748b", fontWeight: "bold", letterSpacing: 2, zIndex: 2
    });

    // Footer Info
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "Date: {{ISSUE_DATE}}",
        x: isPortrait ? 50 : 25, y: isPortrait ? 88 : 94, fontSize: 14, fontFamily: "Inter",
        color: "#94a3b8", fontWeight: "bold", zIndex: 2
    });
    elements.push({
        id: Date.now().toString() + Math.random(), type: "qr", value: "{{QR_CODE}}",
        x: isPortrait ? 50 : 50, y: isPortrait ? 94 : 94, fontSize: 100, zIndex: 2
    });
    elements.push({
        id: Date.now().toString() + Math.random(), type: "text", value: "ID: {{CERT_ID}}",
        x: isPortrait ? 50 : 75, y: isPortrait ? 88 : 94, fontSize: 14, fontFamily: "Inter",
        color: "#94a3b8", fontWeight: "bold", zIndex: 2
    });

    return JSON.stringify({
        elements,
        style: {
            borderColor: theme.border,
            borderWidth: isPortrait ? 20 : 25,
            backgroundColor: "#ffffff",
            orientation: isPortrait ? "VERTICAL" : "HORIZONTAL"
        }
    });
}

const TEMPLATES = [
    { name: 'Course Completion Certificate', theme: THEMES.GOLD, isPortrait: false, desc: 'Classic premium gold template for standard courses' },
    { name: 'Professional Certification', theme: THEMES.SLATE, isPortrait: false, desc: 'Modern corporate slate design for professional credentials' },
    { name: 'Workshop Certificate', theme: THEMES.BLUE, isPortrait: false, desc: 'Vibrant blue template for workshops and bootcamps' },
    { name: 'Webinar Certificate', theme: THEMES.EMERALD, isPortrait: true, desc: 'Clean emerald portrait design for online events' },
    { name: 'Seminar Certificate', theme: THEMES.ROSE, isPortrait: false, desc: 'Elegant rose theme for academic seminars' },
    { name: 'Corporate Training Certificate', theme: THEMES.SLATE, isPortrait: false, desc: 'Strictly professional layout for corporate training' },
    { name: 'Internship Certificate', theme: THEMES.BLUE, isPortrait: true, desc: 'Portrait layout for internship completion' },
    { name: 'Industrial Training Certificate', theme: THEMES.SILVER, isPortrait: false, desc: 'Industrial themed silver/gray modern layout' },
    { name: 'Faculty Development Program (FDP)', theme: THEMES.GOLD, isPortrait: false, desc: 'Academic gold standard for faculty programs' },
    { name: 'AI Certification', theme: THEMES.SLATE, isPortrait: false, desc: 'Futuristic dark slate theme for tech certifications' },
    { name: 'Cyber Security Certification', theme: THEMES.EMERALD, isPortrait: false, desc: 'Secure emerald green tech template' },
    { name: 'Skill Assessment Certificate', theme: THEMES.SILVER, isPortrait: false, desc: 'Minimalist assessment record template' },
    { name: 'Placement Readiness Certificate', theme: THEMES.BLUE, isPortrait: false, desc: 'Corporate ready blue theme' },
    { name: 'Campus Hiring Participation', theme: THEMES.ROSE, isPortrait: true, desc: 'Portrait appreciation for campus events' },
    { name: 'Appreciation Certificate', theme: THEMES.GOLD, isPortrait: false, desc: 'Premium gold appreciation award' },
    { name: 'Recognition Award', theme: THEMES.SLATE, isPortrait: false, desc: 'High-end recognition template' },
    { name: 'Excellence Award', theme: THEMES.GOLD, isPortrait: true, desc: 'Portrait layout for excellence awards' },
    { name: 'Achievement Award', theme: THEMES.EMERALD, isPortrait: false, desc: 'Emerald achievement recognition' },
    { name: 'Employee Appreciation', theme: THEMES.BLUE, isPortrait: false, desc: 'Corporate employee appreciation' },
    { name: 'Volunteer Certificate', theme: THEMES.ROSE, isPortrait: false, desc: 'Warm rose theme for volunteering' },
];

async function seed() {
    console.log('Clearing existing templates...');
    await prisma.certificateTemplate.deleteMany({});
    
    console.log('Seeding 20 premium templates...');
    
    for (let i = 0; i < TEMPLATES.length; i++) {
        const t = TEMPLATES[i];
        const canvasData = generateCanvasData(t.name, t.theme, t.isPortrait);
        
        await prisma.certificateTemplate.create({
            data: {
                name: t.name,
                description: t.desc,
                designUrl: '', // To be filled with actual background if user uploads
                isDefault: i === 0,
                isActive: true,
                canvasData: canvasData,
                orientation: t.isPortrait ? 'VERTICAL' : 'HORIZONTAL',
                purpose: t.name.includes('Appreciation') ? 'APPRECIATION' : 'COURSE_COMPLETION'
            }
        });
        console.log(`Created template: ${t.name}`);
    }
    
    console.log('Successfully seeded all templates.');
}

seed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
