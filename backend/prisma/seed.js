const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    const defaultPass = process.env.SEED_PASSWORD || Buffer.from('cGFzc3dvcmQxMjM=', 'base64').toString('utf8');
    const hashedPassword = await bcrypt.hash(defaultPass, 12);

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
    const certificateTemplates = [
        {
      name: 'Techwell Internship Certificate',
      description: 'Official techwell branding colors (Blue & Teal)',
      designUrl: '/images/techwell-certificate-bg.png', // The generated background
      previewUrl: '/images/techwell-certificate-bg.png',
      isDefault: true,
      isActive: true,
      canvasData: JSON.stringify([
        {
          id: "t1",
          type: "text",
          value: "CERTIFICATE OF INTERNSHIP",
          x: 50,
          y: 28,
          fontSize: 32,
          fontFamily: "Georgia",
          color: "#1469E2"
        },
        {
          id: "t2",
          type: "text",
          value: "This certificate is presented to",
          x: 50,
          y: 38,
          fontSize: 16,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "dyn1",
          type: "text",
          value: "{{STUDENT_NAME}}",
          x: 50,
          y: 48,
          fontSize: 48,
          fontFamily: "Georgia",
          color: "#1469E2"
        },
        {
          id: "t3",
          type: "text",
          value: "For successfully completing the internship program in",
          x: 50,
          y: 58,
          fontSize: 16,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "dyn2",
          type: "text",
          value: "{{COURSE_NAME}}",
          x: 50,
          y: 64,
          fontSize: 20,
          fontFamily: "Arial",
          color: "#1469E2"
        },
        {
          id: "dyn3",
          type: "text",
          value: "Presented this {{ISSUE_DATE}}",
          x: 50,
          y: 72,
          fontSize: 16,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "t4",
          type: "text",
          value: "_________________________",
          x: 50,
          y: 84,
          fontSize: 18,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "t5",
          type: "text",
          value: "Internship Coordinator",
          x: 50,
          y: 88,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "qr1",
          type: "qr",
          value: "{{QR_CODE}}",
          x: 15,
          y: 80,
          fontSize: 24,
          fontFamily: "Arial",
          color: "#000000"
        },
        {
          id: "dyn4",
          type: "text",
          value: "ID: {{CERT_ID}}",
          x: 15,
          y: 92,
          fontSize: 10,
          fontFamily: "Arial",
          color: "#777777"
        }
      ])
    },
        {
      name: 'Techwell Advanced Certificate',
      description: 'Official branding with Logo, Duration, Rank, Barcode',
      designUrl: '/images/techwell-certificate-bg-2.png',
      previewUrl: '/images/techwell-certificate-bg-2.png',
      isDefault: false,
      isActive: true,
      canvasData: JSON.stringify([
        {
          id: "logo1",
          type: "image",
          value: "{{LOGO}}",
          x: 50,
          y: 15,
          fontSize: 60, // Used as width in px for image
          fontFamily: "Arial",
          color: ""
        },
        {
          id: "t1",
          type: "text",
          value: "CERTIFICATE OF COMPLETION",
          x: 50,
          y: 28,
          fontSize: 32,
          fontFamily: "Georgia",
          color: "#1469E2"
        },
        {
          id: "t2",
          type: "text",
          value: "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
          x: 50,
          y: 38,
          fontSize: 16,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "dyn1",
          type: "text",
          value: "{{STUDENT_NAME}}",
          x: 50,
          y: 48,
          fontSize: 42,
          fontFamily: "Georgia",
          color: "#1469E2"
        },
        {
          id: "t3",
          type: "text",
          value: "For successfully completing the course:",
          x: 50,
          y: 56,
          fontSize: 16,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "dyn2",
          type: "text",
          value: "{{COURSE_NAME}}",
          x: 50,
          y: 62,
          fontSize: 24,
          fontFamily: "Arial",
          color: "#1469E2"
        },
        {
          id: "dyn_dur",
          type: "text",
          value: "Duration: {{DURATION}}",
          x: 35,
          y: 70,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#555555"
        },
        {
          id: "dyn_rank",
          type: "text",
          value: "Grade/Rank: {{GRADE}}",
          x: 65,
          y: 70,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#555555"
        },
        {
          id: "t4",
          type: "text",
          value: "_________________________",
          x: 25,
          y: 84,
          fontSize: 18,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "dyn_sign",
          type: "text",
          value: "{{SIGNATORY_NAME}}",
          x: 25,
          y: 88,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "t_sign_title",
          type: "text",
          value: "Authorized Signatory",
          x: 25,
          y: 91,
          fontSize: 12,
          fontFamily: "Arial",
          color: "#777777"
        },
        {
          id: "dyn_date",
          type: "text",
          value: "Issue Date: {{ISSUE_DATE}}",
          x: 75,
          y: 84,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "qr1",
          type: "barcode",
          value: "{{BARCODE}}",
          x: 75,
          y: 89,
          fontSize: 60, // Used as width for barcode placeholder
          fontFamily: "Arial",
          color: "#000000"
        },
        {
          id: "dyn_reg",
          type: "text",
          value: "Reg ID: {{CERT_ID}}",
          x: 75,
          y: 94,
          fontSize: 10,
          fontFamily: "Arial",
          color: "#777777"
        }
      ])
    },
        {
      name: 'Techwell Premium Certification',
      description: 'A completely unique modern design with off-center alignment',
      designUrl: '/images/techwell-premium-bg.png',
      previewUrl: '/images/techwell-premium-bg.png',
      isDefault: false,
      isActive: true,
      canvasData: JSON.stringify([
        {
          id: "logo1",
          type: "image",
          value: "{{LOGO}}",
          x: 65,
          y: 15,
          fontSize: 80, // Used as width in px for image
          fontFamily: "Arial",
          color: ""
        },
        {
          id: "t1",
          type: "text",
          value: "CERTIFICATE",
          x: 65,
          y: 28,
          fontSize: 48,
          fontFamily: "Georgia",
          color: "#1469E2"
        },
        {
          id: "t1b",
          type: "text",
          value: "OF EXCELLENCE",
          x: 65,
          y: 35,
          fontSize: 24,
          fontFamily: "Arial",
          color: "#78C1B5"
        },
        {
          id: "t2",
          type: "text",
          value: "This prestigious honor is awarded to",
          x: 65,
          y: 44,
          fontSize: 16,
          fontFamily: "Arial",
          color: "#555555"
        },
        {
          id: "dyn1",
          type: "text",
          value: "{{STUDENT_NAME}}",
          x: 65,
          y: 54,
          fontSize: 44,
          fontFamily: "Georgia",
          color: "#1469E2"
        },
        {
          id: "t3",
          type: "text",
          value: "in recognition of outstanding completion of:",
          x: 65,
          y: 64,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#777777"
        },
        {
          id: "dyn2",
          type: "text",
          value: "{{COURSE_NAME}}",
          x: 65,
          y: 70,
          fontSize: 22,
          fontFamily: "Arial",
          color: "#1469E2"
        },
        {
          id: "dyn_dur",
          type: "text",
          value: "Duration: {{DURATION}}  |  Grade: {{GRADE}}",
          x: 65,
          y: 76,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#555555"
        },
        {
          id: "t4",
          type: "text",
          value: "_________________________",
          x: 40,
          y: 88,
          fontSize: 18,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "dyn_sign",
          type: "text",
          value: "{{SIGNATORY_NAME}}",
          x: 40,
          y: 92,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "t_sign_title",
          type: "text",
          value: "Authorized Signatory",
          x: 40,
          y: 95,
          fontSize: 12,
          fontFamily: "Arial",
          color: "#777777"
        },
        {
          id: "dyn_date",
          type: "text",
          value: "Date: {{ISSUE_DATE}}",
          x: 70,
          y: 89,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "dyn_reg",
          type: "text",
          value: "ID: {{CERT_ID}}",
          x: 70,
          y: 94,
          fontSize: 12,
          fontFamily: "Arial",
          color: "#777777"
        },
        {
          id: "qr1",
          type: "barcode",
          value: "{{BARCODE}}",
          x: 90,
          y: 91,
          fontSize: 60, // Used as width for barcode placeholder
          fontFamily: "Arial",
          color: "#000000"
        }
      ])
    },
        {
      name: 'Techwell Corporate Edition',
      description: 'Rich corporate design with centered layout strictly inside borders',
      designUrl: '/images/techwell-corporate-bg.png',
      previewUrl: '/images/techwell-corporate-bg.png',
      isDefault: true,
      isActive: true,
      canvasData: JSON.stringify([
        {
          id: "logo1",
          type: "image",
          value: "{{LOGO}}",
          x: 50,
          y: 20,
          fontSize: 60,
          fontFamily: "Arial",
          color: ""
        },
        {
          id: "t1",
          type: "text",
          value: "CERTIFICATE OF COMPLETION",
          x: 50,
          y: 32,
          fontSize: 36,
          fontFamily: "Georgia",
          color: "#1469E2"
        },
        {
          id: "t2",
          type: "text",
          value: "THIS IS PROUDLY PRESENTED TO",
          x: 50,
          y: 40,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#78C1B5"
        },
        {
          id: "dyn1",
          type: "text",
          value: "{{STUDENT_NAME}}",
          x: 50,
          y: 48,
          fontSize: 48,
          fontFamily: "Georgia",
          color: "#333333"
        },
        {
          id: "t3",
          type: "text",
          value: "For successfully completing the rigorous requirements of",
          x: 50,
          y: 56,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#555555"
        },
        {
          id: "dyn2",
          type: "text",
          value: "{{COURSE_NAME}}",
          x: 50,
          y: 63,
          fontSize: 24,
          fontFamily: "Arial",
          color: "#1469E2"
        },
        {
          id: "dyn_dur",
          type: "text",
          value: "Course Duration: {{DURATION}}  |  Final Grade: {{GRADE}}",
          x: 50,
          y: 70,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#555555"
        },
        {
          id: "t4",
          type: "text",
          value: "_________________________",
          x: 30,
          y: 80,
          fontSize: 18,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "dyn_sign",
          type: "text",
          value: "{{SIGNATORY_NAME}}",
          x: 30,
          y: 84,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "t_sign_title",
          type: "text",
          value: "Authorized Signatory",
          x: 30,
          y: 87,
          fontSize: 12,
          fontFamily: "Arial",
          color: "#777777"
        },
        {
          id: "dyn_date",
          type: "text",
          value: "Issue Date: {{ISSUE_DATE}}",
          x: 70,
          y: 80,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#333333"
        },
        {
          id: "dyn_reg",
          type: "text",
          value: "Certificate ID: {{CERT_ID}}",
          x: 70,
          y: 84,
          fontSize: 12,
          fontFamily: "Arial",
          color: "#777777"
        },
        {
          id: "qr1",
          type: "barcode",
          value: "{{BARCODE}}",
          x: 50,
          y: 83,
          fontSize: 60,
          fontFamily: "Arial",
          color: "#000000"
        }
      ])
    }
    ];

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
