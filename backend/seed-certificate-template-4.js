const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.certificateTemplate.create({
    data: {
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
