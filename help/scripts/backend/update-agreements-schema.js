const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const newModels = `
model AgreementTemplate {
  id          String   @id @default(cuid())
  vertical    String
  title       String
  content     String   // HTML or rich text template
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  agreements  ClientAgreement[]
}

model LegalClause {
  id          String   @id @default(cuid())
  title       String
  category    String   // NDA, SLA, REFUND, IP, etc.
  content     String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ClientAgreement {
  id                String   @id @default(cuid())
  agreementNum      String   @unique
  customerId        String
  templateId        String?
  vertical          String
  title             String
  status            String   @default("DRAFT") // DRAFT, SENT, SIGNED, ACTIVE, EXPIRED, RENEWED, CANCELLED
  content           String   // The full rich text content
  totalValue        Float    @default(0)
  taxPercentage     Float    @default(0)
  taxAmount         Float    @default(0)
  grandTotal        Float    @default(0)
  validFrom         DateTime?
  validUntil        DateTime?
  pdfUrl            String?
  clientSignature   String?  // Base64 or URL
  clientSignedAt    DateTime?
  clientIp          String?
  adminSignature    String?
  adminSignedAt     DateTime?
  adminId           String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  customer          Customer           @relation(fields: [customerId], references: [id], onDelete: Cascade)
  template          AgreementTemplate? @relation(fields: [templateId], references: [id])
  milestones        AgreementMilestone[]
  versions          AgreementVersion[]
}

model AgreementMilestone {
  id            String   @id @default(cuid())
  agreementId   String
  title         String
  description   String?
  amount        Float
  dueDate       DateTime?
  status        String   @default("PENDING") // PENDING, COMPLETED, INVOICED, PAID
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  agreement     ClientAgreement @relation(fields: [agreementId], references: [id], onDelete: Cascade)
}

model AgreementVersion {
  id            String   @id @default(cuid())
  agreementId   String
  versionNum    Int
  content       String
  changes       String?
  createdAt     DateTime @default(now())

  agreement     ClientAgreement @relation(fields: [agreementId], references: [id], onDelete: Cascade)
}
`;

// Append models if not exist
if (!schema.includes('model ClientAgreement')) {
    schema += '\n' + newModels;
    
    // Add relation to Customer model
    const customerBlockRegex = /(model Customer \{[\s\S]*?)(^\})/m;
    schema = schema.replace(customerBlockRegex, '$1  agreements        ClientAgreement[]\n$2');
    
    fs.writeFileSync(schemaPath, schema);
    console.log('Successfully updated schema.prisma');
} else {
    console.log('Models already exist in schema.prisma');
}
