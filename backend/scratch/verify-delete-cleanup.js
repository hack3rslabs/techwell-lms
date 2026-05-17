const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Helper to extract unique uploaded file paths/URLs containing "/uploads/" from a string or object.
function extractUploadFiles(value) {
    if (!value) return [];
    let strValue = '';
    if (typeof value === 'string') {
        strValue = value;
    } else if (typeof value === 'object') {
        try {
            strValue = JSON.stringify(value);
        } catch (e) {
            return [];
        }
    } else {
        return [];
    }
    const matches = strValue.match(/\/uploads\/[a-zA-Z0-9_\.\-\/]+/g);
    if (!matches) return [];
    return [...new Set(matches)];
}

async function test() {
    console.log("Starting verification test...");
    
    // Create physical dummy files
    const uploadsDir = path.join(__dirname, '../uploads');
    
    const dummyThumbnailPath = path.join(uploadsDir, 'test-thumbnail.png');
    const dummyBannerPath = path.join(uploadsDir, 'test-banner.png');
    const dummyVideoPath = path.join(uploadsDir, 'test-video.mp4');
    const dummyResourcePath = path.join(uploadsDir, 'test-resource.pdf');
    const dummySubmissionPath = path.join(uploadsDir, 'test-submission.pdf');
    
    await fs.writeFile(dummyThumbnailPath, 'dummy thumbnail content');
    await fs.writeFile(dummyBannerPath, 'dummy banner content');
    await fs.writeFile(dummyVideoPath, 'dummy video content');
    await fs.writeFile(dummyResourcePath, 'dummy resource content');
    await fs.writeFile(dummySubmissionPath, 'dummy submission content');
    
    console.log("Dummy files created.");
    
    // Find an existing user (instructor) in the database
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No users found in database to link course. Run migration or create a user first.");
        process.exit(1);
    }
    console.log(`Using user ID: ${user.id} (${user.email})`);
    
    // Create course with relations
    const course = await prisma.course.create({
        data: {
            title: "Verification Test Course " + Date.now(),
            description: "Test course description",
            thumbnail: "/uploads/test-thumbnail.png",
            bannerUrl: "http://localhost:5000/uploads/test-banner.png",
            category: "Development",
            instructorId: user.id,
            modules: {
                create: [
                    {
                        title: "Test Module",
                        description: "Test module description",
                        orderIndex: 0,
                        lessons: {
                            create: [
                                {
                                    title: "Test Lesson",
                                    type: "VIDEO",
                                    videoUrl: "/uploads/test-video.mp4",
                                    content: "Some lesson content",
                                    order: 1,
                                    resources: [
                                        {
                                            name: "Resource PDF",
                                            url: "/uploads/test-resource.pdf"
                                        }
                                    ],
                                    assignmentSubmissions: {
                                        create: [
                                            {
                                                userId: user.id,
                                                fileUrl: "/uploads/test-submission.pdf",
                                                content: "Submission content text"
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });
    
    console.log(`Course created with ID: ${course.id}`);
    
    // Simulating endpoint logic: load course with modules/lessons/submissions
    const courseWithFiles = await prisma.course.findUnique({
        where: { id: course.id },
        include: {
            modules: {
                include: {
                    lessons: {
                        include: {
                            assignmentSubmissions: true
                        }
                    }
                }
            }
        }
    });
    
    const filesToDelete = new Set();
    const addFiles = (value) => {
        const extracted = extractUploadFiles(value);
        extracted.forEach(file => filesToDelete.add(file));
    };

    addFiles(courseWithFiles.thumbnail);
    addFiles(courseWithFiles.bannerUrl);

    if (courseWithFiles.modules) {
        for (const mod of courseWithFiles.modules) {
            if (mod.lessons) {
                for (const lesson of mod.lessons) {
                    addFiles(lesson.videoUrl);
                    addFiles(lesson.content);
                    addFiles(lesson.resources);
                    addFiles(lesson.settings);

                    if (lesson.assignmentSubmissions) {
                        for (const submission of lesson.assignmentSubmissions) {
                            addFiles(submission.fileUrl);
                            addFiles(submission.content);
                        }
                    }
                }
            }
        }
    }
    
    console.log("Files detected for deletion:", Array.from(filesToDelete));
    
    // Delete database course record
    await prisma.course.delete({
        where: { id: course.id }
    });
    console.log("Course successfully deleted from database.");
    
    // Delete files from the filesystem
    let deletedCount = 0;
    for (const fileUrlOrPath of filesToDelete) {
        const uploadsIndex = fileUrlOrPath.indexOf('uploads/');
        if (uploadsIndex !== -1) {
            const relativePath = fileUrlOrPath.substring(uploadsIndex);
            const absolutePath = path.join(__dirname, '../', relativePath);
            try {
                await fs.access(absolutePath);
                await fs.unlink(absolutePath);
                console.log(`Successfully deleted associated file: ${absolutePath}`);
                deletedCount++;
            } catch (err) {
                console.error(`Failed to delete associated file ${absolutePath}:`, err.message);
            }
        }
    }
    
    console.log(`Files deleted from disk: ${deletedCount}/${filesToDelete.size}`);
    
    // Final verification checks
    let filesExist = false;
    for (const p of [dummyThumbnailPath, dummyBannerPath, dummyVideoPath, dummyResourcePath, dummySubmissionPath]) {
        try {
            await fs.access(p);
            console.error(`Error: File still exists on disk: ${p}`);
            filesExist = true;
        } catch (e) {
            // expected behavior: file does not exist
        }
    }
    
    if (filesExist) {
        console.error("FAIL: Some files were not successfully deleted!");
    } else {
        console.log("SUCCESS: All dummy files successfully cleaned up from filesystem!");
    }
    
    await prisma.$disconnect();
}

test().catch(async (e) => {
    console.error("Error running test:", e);
    await prisma.$disconnect();
});
