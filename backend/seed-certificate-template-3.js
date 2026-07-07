const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.certificateTemplate.create({
    data: {
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
