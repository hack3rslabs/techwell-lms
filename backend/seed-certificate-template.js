const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.certificateTemplate.create({
    data: {
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
    }
  });

  console.log('Template created with ID:', template.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
