const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.certificateTemplate.create({
    data: {
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
