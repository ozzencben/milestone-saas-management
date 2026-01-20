/*
  Warnings:

  - The values [GITHUB,DEMO] on the enum `ResourceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ResourceType_new" AS ENUM ('LINK', 'FILE');
ALTER TABLE "ProjectResource" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "ProjectResource" ALTER COLUMN "type" TYPE "ResourceType_new" USING ("type"::text::"ResourceType_new");
ALTER TYPE "ResourceType" RENAME TO "ResourceType_old";
ALTER TYPE "ResourceType_new" RENAME TO "ResourceType";
DROP TYPE "ResourceType_old";
ALTER TABLE "ProjectResource" ALTER COLUMN "type" SET DEFAULT 'LINK';
COMMIT;

-- AlterTable
ALTER TABLE "ProjectResource" ADD COLUMN     "mimeType" TEXT;
