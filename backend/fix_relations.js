const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// The string in User is `conversations             Conversation[]          @relation("UserConversations")`
const userTarget = 'conversations             Conversation[]          @relation("UserConversations")';
if (content.includes(userTarget)) {
    content = content.replace(userTarget, userTarget + `\n  // Campus & Consultancy
  campusDrivesEmployer   CampusDrive[]             @relation("EmployerCampusDrives")
  campusDriveParticipations CampusDriveStudent[]
  bulkUploads            BulkUploadLog[]
  consultancyCoordsAsEmployer ConsultancyCoordination[] @relation("EmployerCoordination")
  consultancyCoordsAsAdmin    ConsultancyCoordination[] @relation("AdminCoordination")`);
}

// The string in Institute is `users     User[]`
const instTarget = 'users     User[]';
if (content.includes(instTarget)) {
    content = content.replace(instTarget, instTarget + `\n  type                  InstituteType   @default(TRAINING_INSTITUTE)
  status                InstituteStatus @default(APPROVED)
  contactPerson         String?
  state                 String?
  district              String?
  city                  String?
  accreditation         String?
  themeColor            String?
  certificateTemplateId String?
  emailTemplate         String?
  landingPageUrl        String?
  subdomain             String?         @unique
  campusDrives          CampusDrive[]
  bulkUploads           BulkUploadLog[]
  consultancyCoords     ConsultancyCoordination[]`);
}

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Fixed relations successfully');
