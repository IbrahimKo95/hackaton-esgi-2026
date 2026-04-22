/*
  Warnings:

  - Added the required column `hotelId` to the `Distinction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DistinctionType" ADD VALUE 'ONE_KEY';
ALTER TYPE "DistinctionType" ADD VALUE 'TWO_KEYS';
ALTER TYPE "DistinctionType" ADD VALUE 'THREE_KEYS';

-- AlterTable
ALTER TABLE "Distinction" ADD COLUMN     "hotelId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Distinction" ADD CONSTRAINT "Distinction_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
