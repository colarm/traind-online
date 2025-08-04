/*
  Warnings:

  - You are about to drop the column `authorId` on the `trainds` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."trainds" DROP CONSTRAINT "trainds_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."trainds" DROP COLUMN "authorId";

-- AddForeignKey
ALTER TABLE "public"."trainds" ADD CONSTRAINT "trainds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
