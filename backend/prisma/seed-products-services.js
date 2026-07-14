const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding products and services...');

    const products = [
        {
            name: 'LMS Platform',
            slug: 'lms-platform',
            description: 'A premium enterprise Learning Management System featuring automated certifications, live trainer integration, AI-driven mock interviews, and student progression analytics.',
            category: 'LMS',
            price: 49999.00,
            features: [
                'Automated Certificate Issuance with bar-coded verification seals.',
                'Live Class Schedules & Interactive Lesson Comments.',
                'AI Mock Interview Sandbox (Resume & JD based).',
                'Advanced Role-Based Access Control (RBAC).',
                'Custom White-Labeling for Universities.'
            ],
            demoUrl: 'https://demo.twiis.in/lms',
            isActive: true
        },
        {
            name: 'TWIIS ERP Solution',
            slug: 'twiis-erp',
            description: 'Comprehensive Enterprise Resource Planning software tailored for operations, human resource management, CRM tracking, financial ledgers, and automated invoicing.',
            category: 'ERP',
            price: 120000.00,
            features: [
                'Lead Conversion & Student Enrollment Request Workflows.',
                'Automatic Invoice generation & Multi-gateway Payment tracking.',
                'Staff Attendance & Payroll processing modules.',
                'Real-time financial analytics dashboards.'
            ],
            demoUrl: 'https://demo.twiis.in/erp',
            isActive: true
        },
        {
            name: 'College Management System',
            slug: 'college-management-system',
            description: 'Seamless student lifecycle tracking, admissions workflows, semester examinations, digital fees collection, and smart batch scheduling for universities.',
            category: 'COLLEGE_MGMT',
            price: 85000.00,
            features: [
                'Digital Admissions Portal & Student Registration.',
                'Semester Grading & Online Marksheet generation.',
                'Fees collection with automatic reminders.',
                'Campus placement readiness scoring analytics.'
            ],
            demoUrl: 'https://demo.twiis.in/college-cms',
            isActive: true
        },
        {
            name: 'School Management System',
            slug: 'school-management-system',
            description: 'A cloud-based portal connecting parents, teachers, and school administrations with real-time class announcements, homework submissions, and digital reports cards.',
            category: 'SCHOOL_MGMT',
            price: 35000.00,
            features: [
                'Parent-Teacher communication app hooks.',
                'Daily Attendance tracker & SMS notification integration.',
                'Class schedules & Academic calendars.',
                'In-app homework grading & submission.'
            ],
            demoUrl: 'https://demo.twiis.in/school-cms',
            isActive: true
        },
        {
            name: 'Asset Management System',
            slug: 'asset-management-system',
            description: 'Enterprise IT & infrastructure asset tracking software with digital inventory logs, scheduled hardware maintenance alerts, and deployment monitoring.',
            category: 'ASSET_MGMT',
            price: 60000.00,
            features: [
                'Barcode and QR scanning asset audits.',
                'Maintenance ticketing & vendor management.',
                'Real-time hardware depletion & purchase warnings.',
                'Endpoint software compliance tracking.'
            ],
            demoUrl: 'https://demo.twiis.in/assets',
            isActive: true
        },
        {
            name: 'Ledger Book',
            slug: 'ledger-book',
            description: 'GST-compliant digital invoicing and accounting product to manage business expenses, inventory items, and tax filing reports.',
            category: 'BILLING',
            price: 12000.00,
            features: [
                'GST & Non-GST invoice templates.',
                'Daily cash flow, sales summaries & purchase orders.',
                'Inventory stock check alerts.',
                'Hostable on custom domain (ledger.twiis.in).'
            ],
            demoUrl: 'http://ledger.twiis.in',
            isActive: true
        }
    ];

    const services = [
        {
            name: 'IT Infrastructure Services',
            slug: 'it-infrastructure-services',
            description: 'Comprehensive IT support, managed systems hosting, Maintenance Support Contracts, secure endpoint client settings, and centralized IT hardware management.',
            category: 'IT_INFRASTRUCTURE',
            features: [
                '24/7 Managed IT Support Helpdesk.',
                'Maintenance Support Contracts for corporate hardware.',
                'Endpoint Client configuration, antivirus enforcement & patching.',
                'Enterprise Asset Auditing & Network Optimization.'
            ],
            isActive: true
        },
        {
            name: 'Cloud Solutions',
            slug: 'cloud-solutions',
            description: 'Professional migration, optimization, and administration services for Azure, AWS, and secure Hybrid Cloud infrastructures.',
            category: 'CLOUD_SOLUTIONS',
            features: [
                'Azure & AWS cloud infrastructure design.',
                'Legacy application cloud migration with minimal downtime.',
                'Hybrid Cloud configurations connecting on-premise servers.',
                'Cost optimization and performance scaling audits.'
            ],
            isActive: true
        },
        {
            name: 'Cyber Security Services',
            slug: 'cyber-security-services',
            description: 'Robust application vulnerability analysis, endpoint firewalls, network monitoring, security policy assessments, and compliance audits.',
            category: 'CYBER_SECURITY',
            features: [
                'Vulnerability Assessment and Penetration Testing (VAPT).',
                'Application source code security audits.',
                'Endpoint and internal network firewall controls.',
                'Security awareness training & policy mapping.'
            ],
            isActive: true
        },
        {
            name: 'Software Development Services',
            slug: 'software-development-services',
            description: 'High-performance bespoke web development, custom enterprise applications, software-as-a-service (SaaS) portals, and mobile apps for iOS and Android.',
            category: 'SOFTWARE_DEVELOPMENT',
            features: [
                'Custom Web Application Development (Next.js, Node, React).',
                'SaaS Product Architecture & Multi-tenant Databases.',
                'Bespoke Enterprise ERP & workflow solutions.',
                'Native & Cross-platform Mobile App Development.'
            ],
            isActive: true
        },
        {
            name: 'Digital Services',
            slug: 'digital-services',
            description: 'Custom corporate web designs, Search Engine Optimization (SEO), organic digital marketing campaign planning, and corporate branding designs.',
            category: 'DIGITAL_SERVICES',
            features: [
                'Responsive corporate web design & CMS portals.',
                'Technical Search Engine Optimization (SEO) & keyword growth.',
                'Digital Brand development (logos, guidelines, media kits).',
                'Inbound marketing & search visibility campaigns.'
            ],
            isActive: true
        }
    ];

    // Seed Products
    for (const p of products) {
        await prisma.product.upsert({
            where: { slug: p.slug },
            update: p,
            create: p
        });
    }
    console.log('✅ SaaS Products seeded');

    // Seed Services
    for (const s of services) {
        await prisma.service.upsert({
            where: { slug: s.slug },
            update: s,
            create: s
        });
    }
    console.log('✅ IT Services seeded');

    console.log('🌱 Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
