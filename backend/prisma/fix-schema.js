const fs = require('fs');

const path = 'E:/FinalProjects/techwell-lms/backend/prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

// eslint-disable-next-line no-regex-spaces
const regex = /  taxPercentage     Float    @default\(0\)\n  customer          Customer/m;
const replacement = `  taxPercentage     Float    @default(0)
  taxAmount         Float    @default(0)
  grandTotal        Float    @default(0)
  validFrom         DateTime?
  validUntil        DateTime?
  pdfUrl            String?
  clientSignature   String?  // Base64 or URL
  clientSignedAt    DateTime?
  clientPhotoUrl    String?  // Base64 or URL for live photo
  clientPhotoAt     DateTime?
  clientIp          String?
  adminSignature    String?
  adminSignedAt     DateTime?
  adminId           String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  customer          Customer`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Schema restored successfully.");
} else {
    console.log("Could not find the broken block.");
}
