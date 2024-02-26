/*
  Warnings:

  - You are about to drop the column `regionId` on the `Accommodation` table. All the data in the column will be lost.
  - You are about to drop the column `checkedOutAt` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Accommodation" DROP COLUMN "regionId";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "checkedOutAt";
