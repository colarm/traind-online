/*
  Warnings:

  - You are about to drop the column `language` on the `user_preferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."user_preferences" DROP COLUMN "language",
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "makeTraindsPublicAsDefault" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "theme" SET DEFAULT 'theme-cool-white';
