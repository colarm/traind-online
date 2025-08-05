/*
  Warnings:

  - A unique constraint covering the columns `[userId,traindId]` on the table `history` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "history_userId_traindId_key" ON "public"."history"("userId", "traindId");
