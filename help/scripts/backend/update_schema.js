const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

const appendContent = `

// -----------------------------------------------------------------------------
// MULTI-TENANT & CAMPUS HIRING MODELS
// -----------------------------------------------------------------------------

enum InstituteStatus {
  PENDING
  APPROVED
  REJECTED
}

enum InstituteType {
  COLLEGE
  UNIVERSITY
  TRAINING_INSTITUTE
  SKILL_CENTER
}

enum CampusDriveStatus {
  REQUESTED
  APPROVED
  REJECTED
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum HiringMode {
  CAMPUS
  VIRTUAL
  HYBRID
}

model CampusDrive {
  id              String            @id @default(cuid())
  instituteId     String
  employerId      String
  title           String
  description     String?
  skills          String[]          @default([])
  jobRole         String?
  salary          String?
  openings        Int?
  hiringMode      HiringMode        @default(CAMPUS)
  status          CampusDriveStatus @default(REQUESTED)
  targetYear      String?           // Graduation year e.g. "2024"
  departments     String[]          @default([])
  location        String?
  scheduledDate   DateTime?
  completedDate   DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  institute       Institute         @relation(fields: [instituteId], references: [id], onDelete: Cascade)
  employer        User              @relation("EmployerCampusDrives", fields: [employerId], references: [id])
  students        CampusDriveStudent[]
}

model CampusDriveStudent {
  id              String            @id @default(cuid())
  driveId         String
  userId          String
  status          String            @default("ELIGIBLE") // ELIGIBLE, INVITED, APPLIED, SHORTLISTED, INTERVIEW, OFFERED, REJECTED
  resumeUrl       String?
  atsScore        Float             @default(0)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  drive           CampusDrive       @relation(fields: [driveId], references: [id], onDelete: Cascade)
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model BulkUploadLog {
  id              String            @id @default(cuid())
  instituteId     String
  uploadedBy      String
  filename        String
  totalRecords    Int
  successCount    Int
  failedCount     Int
  errors          Json?
  createdAt       DateTime          @default(now())

  institute       Institute         @relation(fields: [instituteId], references: [id], onDelete: Cascade)
  user            User              @relation(fields: [uploadedBy], references: [id])
}

model ConsultancyCoordination {
  id              String            @id @default(cuid())
  employerId      String
  instituteId     String
  techwellAdminId String
  status          String            @default("ACTIVE") // ACTIVE, COMPLETED, CANCELLED
  revenue         Float             @default(0)
  notes           String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  employer        User              @relation("EmployerCoordination", fields: [employerId], references: [id])
  institute       Institute         @relation(fields: [instituteId], references: [id])
  techwellAdmin   User              @relation("AdminCoordination", fields: [techwellAdminId], references: [id])
}
`;

if (!content.includes('model CampusDrive {')) {
    content += appendContent;
}

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Schema appended successfully');
