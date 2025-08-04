/*
  Warnings:

  - You are about to drop the column `title` on the `trainds` table. All the data in the column will be lost.
  - Added the required column `Title` to the `trainds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parameterSetId` to the `trainds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `result` to the `trainds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `trainds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."trainds" DROP COLUMN "title",
ADD COLUMN     "Title" TEXT NOT NULL,
ADD COLUMN     "parameterSetId" TEXT NOT NULL,
ADD COLUMN     "result" JSONB NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;
