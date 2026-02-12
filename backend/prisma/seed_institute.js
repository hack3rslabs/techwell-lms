const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Institute Data...');

    // 1. Create Institute
    const institute = await prisma.institute.create({
        data: {
            name: 'TechWell Logic Institute',
            code: 'TW-LOGIC',
            email: 'admin@logic-institute.com',
            address: '123 Tech Park, Cyber City',
        }
    });

    console.log(`Created Institute: ${institute.name} (${institute.id})`);

    // 2. Create Institute Admin
    const email = 'inst_admin@test.com';
    const upsertUser = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'INSTITUTE_ADMIN',
            instituteId: institute.id,
            isActive: true
        },
        create: {
            email,
            name: 'Institute Admin User',
            role: 'INSTITUTE_ADMIN',
            instituteId: institute.id, // Link to Institute
            isActive: true,
            password: '$2a$12$V.o/P7.O.S./k/h.u.g.o.u.g.h.t.h.e.p.a.s.s.w.o.r.d' // Dummy hash
        },
    });

    console.log(`Created/Updated User: ${upsertUser.email} with Institute ID: ${upsertUser.instituteId}`);

    // 3. Create a Scoped Course
    const course = await prisma.course.create({
        data: {
            title: 'Institute Exclusive: Advanced Logic',
            description: 'A course only for this institute.',
            category: 'Logic',
            instructorId: upsertUser.id,
            instituteId: institute.id, // Link to Institute
            isPublished: true,
            price: 5000
        }
    });
    console.log(`Created Scoped Course: ${course.title}`);

    // 4. Create a Global Course (No Institute)
    const globalCourse = await prisma.course.create({
        data: {
            title: 'Global Logic Basics',
            description: 'Open to everyone.',
            category: 'Logic',
            instructorId: upsertUser.id,
            // No instituteId
            isPublished: true,
            price: 1000
        }
    });
    console.log(`Created Global Course: ${globalCourse.title}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
