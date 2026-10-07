-- Add SUPERADMIN and FACULTY values to Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'FACULTY';

-- CreateEnum for AccountStatus
DO $$ BEGIN
    CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to users table with default APPROVED (so existing users are unaffected)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "AccountStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateIndex for status and role on users table (if not already present)
DO $$ BEGIN
    CREATE INDEX "users_status_idx" ON "users"("status");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "users_role_idx" ON "users"("role");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
