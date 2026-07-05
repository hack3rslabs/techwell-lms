const fs = require('fs');
const data = fs.readFileSync('schema.prisma', 'utf16le'); // Oh wait, let's read as utf8 and see if we can find it.
const utf8Data = fs.readFileSync('schema.prisma', 'utf8');

// The corrupted part is at the end. We know `model Invoice` ends before that.
const invoiceEnd = utf8Data.indexOf('model Invoice {');
if (invoiceEnd !== -1) {
  const closingBrace = utf8Data.indexOf('}', invoiceEnd);
  
  if (closingBrace !== -1) {
    const cleanContent = utf8Data.substring(0, closingBrace + 1);
    
    const newModels = `

model FollowUpTask {
  id          String    @id @default(cuid())
  leadId      String?
  customerId  String?
  title       String
  description String?
  dueDate     DateTime
  status      String    @default("PENDING")
  assignedTo  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lead        Lead?     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: Cascade)
}

model CommunicationLog {
  id          String    @id @default(cuid())
  leadId      String?
  customerId  String?
  type        String
  direction   String
  status      String
  content     String?
  metadata    Json?
  timestamp   DateTime  @default(now())
  lead        Lead?     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: Cascade)
}
`;
    
    fs.writeFileSync('schema.prisma', cleanContent + newModels, 'utf8');
    console.log('Successfully fixed schema.prisma');
  }
}
