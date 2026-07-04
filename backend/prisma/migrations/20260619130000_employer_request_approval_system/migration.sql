-- Add the employer request fields required for approval-based account creation.
ALTER TABLE "EmployerRequest"
ADD COLUMN "companyName" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "passwordHash" TEXT;

-- Preserve legacy request data while moving to the expanded request model.
UPDATE "EmployerRequest"
SET
  "companyName" = COALESCE(NULLIF("designation", ''), "name"),
  "phone" = COALESCE("phone", ''),
  "address" = COALESCE("address", ''),
  "passwordHash" = COALESCE("passwordHash", '');

ALTER TABLE "EmployerRequest"
ALTER COLUMN "companyName" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "passwordHash" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "designation" DROP NOT NULL;

CREATE TYPE "EmployerRequestStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED_APPROVAL'
);

ALTER TABLE "EmployerRequest"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "EmployerRequest"
ALTER COLUMN "status" TYPE "EmployerRequestStatus"
USING ("status"::"EmployerRequestStatus");

ALTER TABLE "EmployerRequest"
ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TYPE "EmployerStatus" ADD VALUE IF NOT EXISTS 'CANCELLED_APPROVAL';

CREATE UNIQUE INDEX "EmployerRequest_email_key" ON "EmployerRequest"("email");
