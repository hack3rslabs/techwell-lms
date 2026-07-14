const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const newModels = `
model SeoMetadata {
  id          String   @id @default(cuid())
  path        String   @unique
  title       String?
  description String?
  keywords    String?
  canonical   String?
  ogImage     String?
  noIndex     Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model RedirectRule {
  id          String   @id @default(cuid())
  source      String   @unique
  destination String
  permanent   Boolean  @default(true) // 301 if true, 302 if false
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SeoAnalytics {
  id          String   @id @default(cuid())
  path        String
  type        String   // e.g., "404", "SLOW_LOAD"
  userAgent   String?
  ipAddress   String?
  createdAt   DateTime @default(now())
}
`;

// Append models if not exist
if (!schema.includes('model SeoMetadata')) {
    schema += '\n' + newModels;
    fs.writeFileSync(schemaPath, schema);
    console.log('Successfully updated schema.prisma with SEO models');
} else {
    console.log('SEO Models already exist in schema.prisma');
}
