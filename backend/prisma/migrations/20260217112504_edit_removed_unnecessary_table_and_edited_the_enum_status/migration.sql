/*
  Warnings:

  - The values [PENDING,VERIFIED,SUSPENDED] on the enum `AgencyStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `AgencyVerification` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AgencyStatus_new" AS ENUM ('ACTIVE', 'CLOSED', 'BANNED');
ALTER TABLE "public"."Agency" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Agency" ALTER COLUMN "status" TYPE "AgencyStatus_new" USING ("status"::text::"AgencyStatus_new");
ALTER TYPE "AgencyStatus" RENAME TO "AgencyStatus_old";
ALTER TYPE "AgencyStatus_new" RENAME TO "AgencyStatus";
DROP TYPE "public"."AgencyStatus_old";
ALTER TABLE "Agency" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "AgencyVerification" DROP CONSTRAINT "AgencyVerification_agencyId_fkey";

-- AlterTable
ALTER TABLE "Agency" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "AgencyVerification";
