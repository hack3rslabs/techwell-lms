const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    const defaultPass = process.env.SEED_PASSWORD || Buffer.from('cGFzc3dvcmQxMjM=', 'base64').toString('utf8');
    const hashedPassword = await bcrypt.hash(defaultPass, 12);

    // Create Super Admin Users (skip if exists)
    const adminEmails = [
        'admin@techwell.co.in',
        'uttam@techwell.co.in',
        'superadmin@techwell.co.in',
        'superdmin@techwell.co.in'
    ];

    for (const email of adminEmails) {
        let superAdmin = await prisma.user.findUnique({ where: { email } });
        if (!superAdmin) {
            superAdmin = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Super Admin',
                    role: 'SUPER_ADMIN',
                    isActive: true,
                    emailVerified: true,
                },
            });
            console.log(`✅ Created Super Admin: ${email}`);
        } else {
            // Ensure existing users get the super admin role
            await prisma.user.update({
                where: { email },
                data: { role: 'SUPER_ADMIN' }
            });
            console.log(`⏭️  Verified Super Admin: ${email}`);
        }
    }

    let instructor = await prisma.user.findUnique({ where: { email: 'instructor@techwell.co.in' } });
    if (!instructor) {
        instructor = await prisma.user.create({
            data: {
                email: 'instructor@techwell.co.in',
                password: hashedPassword,
                name: 'John Instructor',
                role: 'INSTRUCTOR',
                isActive: true,
                emailVerified: true,
            },
        });
        console.log('✅ Created Instructor');
    } else {
        console.log('⏭️  Instructor exists');
    }

    let student = await prisma.user.findUnique({ where: { email: 'student@techwell.co.in' } });
    if (!student) {
        student = await prisma.user.create({
            data: {
                email: 'student@techwell.co.in',
                password: hashedPassword,
                name: 'Jane Student',
                role: 'STUDENT',
                isActive: true,
                emailVerified: true,
            },
        });
        console.log('✅ Created Student');
    } else {
        console.log('⏭️  Student exists');
    }

    let employer = await prisma.user.findUnique({ where: { email: 'employer@techwell.co.in' } });
    if (!employer) {
        employer = await prisma.user.create({
            data: {
                email: 'employer@techwell.co.in',
                password: hashedPassword,
                name: 'Tech Employer',
                role: 'EMPLOYER',
                isActive: true,
                emailVerified: true,
            },
        });
        console.log('✅ Created Employer');
    } else {
        console.log('⏭️  Employer exists');
    }

    // Give Jane Pro access (interview access)
    const existingProEnrollment = await prisma.enrollment.findFirst({
        where: { userId: student.id, hasInterviewAccess: true }
    });
    if (!existingProEnrollment) {
        // Find any course to enroll in
        const anyCourse = await prisma.course.findFirst();
        if (anyCourse) {
            await prisma.enrollment.upsert({
                where: {
                    userId_courseId: {
                        userId: student.id,
                        courseId: anyCourse.id
                    }
                },
                update: {
                    hasInterviewAccess: true,
                    status: 'ACTIVE'
                },
                create: {
                    userId: student.id,
                    courseId: anyCourse.id,
                    hasInterviewAccess: true,
                    status: 'ACTIVE'
                }
            });
            console.log('✅ Gave Jane Pro interview access');
        }
    } else {
        console.log('⏭️  Jane already has Pro access');
    }


    // Create Courses
    const coursesData = [
        { title: 'Complete Web Development Bootcamp', description: 'Master HTML, CSS, JavaScript, React, Node.js and more.', category: 'WEB_DEV', difficulty: 'BEGINNER', duration: 40, price: 4999 },
        { title: 'Advanced React & Next.js Masterclass', description: 'Deep dive into React patterns, Next.js 14, Server Components.', category: 'WEB_DEV', difficulty: 'ADVANCED', duration: 25, price: 5999 },
        { title: 'Data Science with Python', description: 'Learn Python, Pandas, NumPy, Machine Learning basics.', category: 'DATA_SCIENCE', difficulty: 'INTERMEDIATE', duration: 35, price: 6999 },
        { title: 'Cloud Computing with AWS', description: 'Master AWS services including EC2, S3, Lambda.', category: 'CLOUD', difficulty: 'INTERMEDIATE', duration: 30, price: 7999 },
        { title: 'Mobile App Development with React Native', description: 'Build cross-platform iOS and Android apps.', category: 'MOBILE', difficulty: 'INTERMEDIATE', duration: 28, price: 5499 },
        { title: 'Machine Learning & AI Fundamentals', description: 'Introduction to ML algorithms and neural networks.', category: 'AI_ML', difficulty: 'ADVANCED', duration: 45, price: 8999 },
    ];

    for (const data of coursesData) {
        const existing = await prisma.course.findFirst({ where: { title: data.title } });
        if (!existing) {
            const course = await prisma.course.create({
                data: {
                    ...data,
                    instructorId: instructor.id,
                    isPublished: true,
                },
            });
            console.log('✅ Created Course:', data.title);

            // Add modules
            for (let i = 0; i < 4; i++) {
                await prisma.module.create({
                    data: {
                        courseId: course.id,
                        title: ['Getting Started', 'Core Concepts', 'Practical Projects', 'Advanced Topics'][i],
                        description: 'Module description',
                        orderIndex: i,
                    },
                });
            }
        } else {
            console.log('⏭️  Course exists:', data.title);
        }
    }

    // Seed Course Categories
    console.log('\n📚 Seeding Course Categories...');
    const courseCategories = [
        { name: 'Cloud & DevOps Engineering',         slug: 'cloud-devops-engineering',         icon: '☁️',  color: '#0ea5e9', description: 'AWS, Azure, GCP, Docker, Kubernetes, CI/CD pipelines',         orderIndex: 0 },
        { name: 'Software Development',               slug: 'software-development',             icon: '💻',  color: '#6366f1', description: 'Full-stack, backend, frontend, mobile app development',           orderIndex: 1 },
        { name: 'Data Science & Artificial Intelligence', slug: 'data-science-ai',              icon: '🤖',  color: '#8b5cf6', description: 'ML, Deep Learning, NLP, Computer Vision, Data Analytics',         orderIndex: 2 },
        { name: 'Cyber Security',                     slug: 'cyber-security',                   icon: '🔐',  color: '#ef4444', description: 'Ethical hacking, network security, CEH, CISSP, penetration testing', orderIndex: 3 },
        { name: 'Networking & System Administration', slug: 'networking-system-admin',           icon: '🌐',  color: '#10b981', description: 'CCNA, CCNP, Linux admin, Windows Server, routing & switching', orderIndex: 4 },
        { name: 'ERP & SAP',                          slug: 'erp-sap',                          icon: '🏭',  color: '#f59e0b', description: 'SAP S/4HANA, SAP FICO, SAP MM, SAP SD, Oracle ERP',              orderIndex: 5 },
        { name: 'ITSM & CRM Platforms',               slug: 'itsm-crm-platforms',               icon: '🛠️',  color: '#f97316', description: 'ServiceNow, Salesforce, Zendesk, ITIL, Jira Service Management', orderIndex: 6 },
        { name: 'HR Management',                      slug: 'hr-management',                    icon: '👥',  color: '#ec4899', description: 'Talent acquisition, payroll, HRMS, SAP HCM, workforce planning',  orderIndex: 7 },
        { name: 'Finance & Marketing',                slug: 'finance-marketing',                icon: '📊',  color: '#14b8a6', description: 'Digital marketing, financial analysis, CFA, Google Analytics',     orderIndex: 8 },
    ];

    for (const cat of courseCategories) {
        await prisma.courseCategory.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, icon: cat.icon, color: cat.color, description: cat.description, orderIndex: cat.orderIndex },
            create: { ...cat, isActive: true }
        });
        console.log('  ✅ Category:', cat.name);
    }


    // Create sample interview
    const existingInterview = await prisma.interview.findFirst({ where: { userId: student.id } });
    if (!existingInterview) {
        await prisma.interview.create({
            data: {
                userId: student.id,
                domain: 'TECHNOLOGY',
                role: 'Frontend Developer',
                company: 'Google',
                difficulty: 'INTERMEDIATE',
                status: 'COMPLETED',
                scheduledAt: new Date(),
                completedAt: new Date(),
            },
        });
        console.log('✅ Created Sample Interview');
    }

    // RBAC System Seeding
    console.log('\n🔐 Seeding RBAC Permissions...');
    // Clear old features and permissions to avoid unique constraint collisions
    await prisma.rolePermission.deleteMany({});
    await prisma.systemFeature.deleteMany({});
    await prisma.systemPermission.deleteMany({});

    const permissions = [
        { name: 'Dashboard Access', code: 'DASHBOARD', module: 'General' },
        { name: 'Welcome Page', code: 'WELCOME', module: 'General' },
        { name: 'Users & Roles', code: 'USERS_ROLES', module: 'General' },
        { name: 'User Management', code: 'USERS', module: 'General' },
        { name: 'Students', code: 'STUDENTS', module: 'General' },
        { name: 'Staff Portal', code: 'STAFF_PORTAL', module: 'General' },
        { code: 'COURSES', name: 'Course Management', module: 'ADMIN' },
        { code: 'BATCHES', name: 'Batches Management', module: 'ADMIN' },
        { code: 'EVENTS', name: 'Events & Webinars', module: 'ADMIN' },
        { code: 'LIVE_CLASSES', name: 'Live Classes', module: 'ADMIN' },
        { code: 'SKILLCASTS', name: 'Skillcasts', module: 'ADMIN' },
        { code: 'TASKS', name: 'Tasks', module: 'ADMIN' },
        { code: 'AI_INTERVIEWS', name: 'AI Interviews', module: 'ADMIN' },
        { code: 'AUTOMATION_STUDIO', name: 'Automation Studio', module: 'ADMIN' },
        { code: 'FINANCE', name: 'Financial Management', module: 'ADMIN' },
        { code: 'TICKETS', name: 'Support Tickets', module: 'ADMIN' },
        { code: 'SETTINGS', name: 'System Settings', module: 'ADMIN' },
        { code: 'LEADS', name: 'Leads & CRM', module: 'ADMIN' },
        { code: 'CENTRAL_CRM', name: 'Central CRM', module: 'ADMIN' },
        { code: 'MANAGE_EMPLOYER_REQUESTS', name: 'Employer Requests', module: 'ADMIN' },
        { code: 'CONSULTANCY', name: 'Consultancy Hub', module: 'ADMIN' },
        { code: 'REVIEWS', name: 'Reviews', module: 'ADMIN' },
        { code: 'BLOGS', name: 'Blog Management', module: 'ADMIN' },
        { code: 'CERTIFICATES', name: 'Certificates', module: 'ADMIN' },
        { code: 'REPORTS', name: 'Reports & Analytics', module: 'ADMIN' },
        { code: 'SYSTEM_LOGS', name: 'System Logs', module: 'ADMIN' },
        { code: 'CMS', name: 'CMS Management', module: 'Content' },
        { code: 'CMS_MANAGER', name: 'CMS Manager', module: 'Content' },
        { code: 'PAGE_BUILDER', name: 'Page Builder', module: 'Content' },
        { code: 'TEAM_MANAGEMENT', name: 'Team Management', module: 'Content' },
        { code: 'PRODUCTS', name: 'Product Catalog', module: 'Content' },
        { code: 'SERVICES', name: 'Services Catalog', module: 'Content' },
        { code: 'GLOBAL_DATA', name: 'Global Data', module: 'ADMIN' },
        { code: 'COUPONS', name: 'Coupons', module: 'ADMIN' },
        { code: 'TRANSACTIONS', name: 'Transactions', module: 'ADMIN' },
        { code: 'MESSAGES', name: 'Messages', module: 'ADMIN' },
        { code: 'MEETINGS', name: 'Meetings', module: 'ADMIN' },
        { code: 'MARKETING_HUB', name: 'Marketing Hub', module: 'Content' },
        { code: 'MARKETING', name: 'Marketing Core', module: 'Content' },
        { code: 'ADS_MANAGER', name: 'Ads Manager', module: 'Content' },
        { code: 'GALLERY', name: 'Gallery', module: 'Content' },
        { code: 'LIBRARY', name: 'Library', module: 'Content' },
        { code: 'PARTNERSHIPS', name: 'Partnerships & Franchise', module: 'ADMIN' },
        { code: 'APPROVALS', name: 'Approvals', module: 'ADMIN' },
        { code: 'ASSESSMENTS', name: 'Assessments', module: 'ADMIN' },
        { code: 'AUDIT_LOGS', name: 'Audit Logs', module: 'ADMIN' },
        { code: 'BEHAVIOR_ANALYTICS', name: 'Behavior Analytics', module: 'ADMIN' },
        { code: 'CALENDAR', name: 'Calendar', module: 'ADMIN' },
        { code: 'CAMPUS_DRIVES', name: 'Campus Drives', module: 'ADMIN' },
        { code: 'CANDIDATES', name: 'Candidates', module: 'ADMIN' },
        { code: 'CATEGORIES', name: 'Categories', module: 'ADMIN' },
        { code: 'CHMS', name: 'CHMS', module: 'ADMIN' },
        { code: 'CLIENTS', name: 'Clients', module: 'ADMIN' },
        { code: 'COLLEGES', name: 'Colleges', module: 'ADMIN' },
        { code: 'COMPANIES', name: 'Companies', module: 'ADMIN' },
        { code: 'COMPLIANCE', name: 'Compliance', module: 'ADMIN' },
        { code: 'CONSULTANCY_REVENUE', name: 'Consultancy Revenue', module: 'ADMIN' },
        { code: 'CONSULTING', name: 'Consulting', module: 'ADMIN' },
        { code: 'DOCUMENTS', name: 'Documents', module: 'ADMIN' },
        { code: 'EMAIL_SETTINGS', name: 'Email Settings', module: 'ADMIN' },
        { code: 'EMPLOYERS', name: 'Employers', module: 'ADMIN' },
        { code: 'ENROLLS', name: 'Enrollments', module: 'ADMIN' },
        { code: 'FRANCHISE', name: 'Franchise', module: 'ADMIN' },
        { code: 'HELP_CENTER', name: 'Help Center', module: 'ADMIN' },
        { code: 'HR', name: 'Human Resources', module: 'ADMIN' },
        { code: 'INSTITUTES', name: 'Institutes', module: 'ADMIN' },
        { code: 'INTERNSHIPS', name: 'Internships', module: 'ADMIN' },
        { code: 'INTERVIEWS', name: 'Interviews', module: 'ADMIN' },
        { code: 'JOBS', name: 'Jobs', module: 'ADMIN' },
        { code: 'OPERATIONS', name: 'Operations', module: 'ADMIN' },
        { code: 'PARTNERS', name: 'Partners', module: 'ADMIN' },
        { code: 'POSTS', name: 'Posts', module: 'Content' },
        { code: 'PRICING', name: 'Pricing', module: 'ADMIN' },
        { code: 'PROJECTS', name: 'Projects', module: 'ADMIN' },
        { code: 'REFERRALS', name: 'Referrals', module: 'ADMIN' },
        { code: 'REVENUE', name: 'Revenue', module: 'ADMIN' },
        { code: 'SEO', name: 'SEO Settings', module: 'Content' },
        { code: 'SUCCESS_STORIES', name: 'Success Stories', module: 'Content' },
        { code: 'SUPPORT', name: 'Support', module: 'ADMIN' },
        { code: 'TEAM', name: 'Team', module: 'ADMIN' },
        { code: 'TRAINING', name: 'Training', module: 'ADMIN' },
        { code: 'VIDEO_SETTINGS', name: 'Video Settings', module: 'ADMIN' },
    ];

    for (const p of permissions) {
        await prisma.systemPermission.upsert({
            where: { code: p.code },
            update: p,
            create: p
        });
    }

    // Features for UI table
    for (const p of permissions) {
        await prisma.systemFeature.upsert({
            where: { code: p.code },
            update: { name: p.name, module: p.module },
            create: {
                name: p.name,
                code: p.code,
                module: p.module
            }
        });
    }

    console.log('🔐 Seeding RBAC Roles...');
    const roles = [
        {
            name: 'Super Admin',
            isSystem: true,
            permissions: permissions.map(p => p.code)
        },
        {
            name: 'Admin',
            isSystem: true,
            permissions: permissions.map(p => p.code)
        },
        {
            name: 'Institute Admin',
            isSystem: true,
            permissions: ['WELCOME', 'DASHBOARD', 'USERS', 'COURSES', 'FINANCE', 'TICKETS', 'LEADS']
        },
        {
            name: 'Instructor',
            isSystem: true,
            permissions: ['WELCOME', 'DASHBOARD', 'COURSES', 'TICKETS']
        },
        {
            name: 'Student',
            isSystem: true,
            permissions: ['WELCOME', 'COURSES', 'TICKETS']
        },
        {
            name: 'Staff',
            isSystem: true,
            permissions: ['WELCOME', 'DASHBOARD', 'USERS', 'COURSES', 'TICKETS']
        },
        {
            name: 'Employer',
            isSystem: true,
            permissions: ['WELCOME', 'DASHBOARD', 'USERS', 'COURSES']
        },
        {
            name: 'Tele Sales',
            isSystem: true,
            permissions: ['WELCOME', 'DASHBOARD', 'LEADS']
        },
        {
            name: 'Support',
            isSystem: true,
            permissions: ['WELCOME', 'DASHBOARD', 'TICKETS']
        }
    ];

    for (const r of roles) {
        const dbRole = await prisma.systemRole.upsert({
            where: { name: r.name },
            update: { isSystem: true }, // Ensure all seeded roles are system roles
            create: {
                name: r.name,
                isSystem: true,
                description: `${r.name} system role`
            }
        });

        // Setup RolePermissions for the role
        for (const p of permissions) {
            const hasPermission = r.permissions.includes(p.code);
            const feature = await prisma.systemFeature.findUnique({ where: { code: p.code } });
            
            await prisma.rolePermission.upsert({
                where: {
                    roleId_featureId: {
                        roleId: dbRole.id,
                        featureId: feature.id
                    }
                },
                update: {
                    canRead: hasPermission,
                    canCreate: hasPermission,
                    canUpdate: hasPermission,
                    canDelete: hasPermission,
                    isDisabled: !hasPermission
                },
                create: {
                    roleId: dbRole.id,
                    featureId: feature.id,
                    canRead: hasPermission,
                    canCreate: hasPermission,
                    canUpdate: hasPermission,
                    canDelete: hasPermission,
                    isDisabled: !hasPermission
                }
            });
        }
    }

    // Link Super Admin to System Role
    const superAdminRole = await prisma.systemRole.findUnique({ where: { name: 'Super Admin' } });
    if (superAdminRole) {
        await prisma.user.updateMany({
            where: { role: 'SUPER_ADMIN' },
            data: { systemRoleId: superAdminRole.id }
        });
        console.log('✅ Linked Super Admins to System Role');
    }

    
    console.log('\n📜 Seeding Certificate Templates...');
    const fs = require('fs');
    const path = require('path');
    let certificateTemplates = [];
    const templatesPath = path.join(__dirname, 'templates.json');
    if (fs.existsSync(templatesPath)) {
        certificateTemplates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
        console.log(`Loaded ${certificateTemplates.length} templates from templates.json`);
    } else {
        console.log('templates.json not found. Skipping templates seeding.');
    }

    for (const t of certificateTemplates) {
        const existing = await prisma.certificateTemplate.findFirst({ where: { name: t.name } });
        if (existing) {
            await prisma.certificateTemplate.update({
                where: { id: existing.id },
                data: t
            });
        } else {
            await prisma.certificateTemplate.create({
                data: t
            });
        }
        console.log('  ✅ Template:', t.name);
    }

    console.log('\n🎉 Seed completed!\n');
    console.log('📋 Test Credentials:');
    console.log('   admin@techwell.co.in / password123');
    console.log('   instructor@techwell.co.in / password123');
    console.log('   student@techwell.co.in / password123');
}

main()
    .catch((e) => {
        console.error('Seed error:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
