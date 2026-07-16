-- Migration: 1_add_new_roles
-- Description: Adds new Role enum values (TELE_SALES, COUNSELLOR, DEMO_USER, COLLEGE_ADMIN)
-- Safe: Only adds new values to an existing enum. No data is modified or deleted.

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TELE_SALES';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COUNSELLOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DEMO_USER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COLLEGE_ADMIN';
