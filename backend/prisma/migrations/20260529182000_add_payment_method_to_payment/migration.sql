ALTER TABLE "Payment"
ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'ONLINE';

CREATE INDEX "Payment_userId_courseId_status_idx"
ON "Payment"("userId", "courseId", "status");
