-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('PAID', 'PORTFOLIO', 'TEST');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "price" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'PORTFOLIO';
