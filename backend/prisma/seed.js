const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create Users (skip if exists)
    let superAdmin = await prisma.user.findUnique({ where: { email: 'admin@techwell.co.in' } });
    if (!superAdmin) {
        superAdmin = await prisma.user.create({
            data: {
                email: 'admin@techwell.co.in',
                password: hashedPassword,
                name: 'Super Admin',
                role: 'SUPER_ADMIN',
                isActive: true,
                emailVerified: true,
            },
        });
        console.log('✅ Created Super Admin');
    } else {
        console.log('⏭️  Super Admin exists');
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
    const permissions = [
        { code: 'MANAGE_USERS', name: 'Manage Users', module: 'USERS' },
        { code: 'VIEW_USERS', name: 'View Users', module: 'USERS' },
        { code: 'MANAGE_COURSES', name: 'Manage Courses', module: 'COURSES' },
        { code: 'VIEW_COURSES', name: 'View Courses', module: 'COURSES' },
        { code: 'PUBLISH_COURSE', name: 'Publish Course', module: 'COURSES' },
        { code: 'VIEW_FINANCE', name: 'View Finance', module: 'FINANCE' },
        { code: 'MANAGE_TICKETS', name: 'Manage Tickets', module: 'TICKETS' },
        { code: 'VIEW_TICKETS', name: 'View Tickets', module: 'TICKETS' },
        { code: 'MANAGE_ROLES', name: 'Manage Roles', module: 'SETTINGS' },
        { code: 'MANAGE_SETTINGS', name: 'Manage Settings', module: 'SETTINGS' },
    ];

    for (const p of permissions) {
        await prisma.systemPermission.upsert({
            where: { code: p.code },
            update: p,
            create: p
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
            permissions: permissions.map(p => p.code).filter(p => p !== 'MANAGE_ROLES')
        },
        {
            name: 'Institute Admin',
            isSystem: true,
            permissions: ['MANAGE_USERS', 'VIEW_USERS', 'MANAGE_COURSES', 'VIEW_COURSES', 'VIEW_FINANCE', 'MANAGE_TICKETS', 'VIEW_TICKETS']
        },
        {
            name: 'Instructor',
            isSystem: true,
            permissions: ['VIEW_COURSES', 'MANAGE_COURSES', 'VIEW_TICKETS']
        },
        {
            name: 'Student',
            isSystem: true,
            permissions: ['VIEW_COURSES', 'VIEW_TICKETS']
        },
        {
            name: 'Staff',
            isSystem: true,
            permissions: ['VIEW_USERS', 'VIEW_COURSES', 'VIEW_TICKETS', 'MANAGE_TICKETS']
        },
        {
            name: 'Employer',
            isSystem: true,
            permissions: ['VIEW_USERS', 'VIEW_COURSES']
        }
    ];

    for (const r of roles) {
        await prisma.systemRole.upsert({
            where: { name: r.name },
            update: { permissions: r.permissions },
            create: {
                name: r.name,
                isSystem: r.isSystem,
                permissions: r.permissions
            }
        });
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
