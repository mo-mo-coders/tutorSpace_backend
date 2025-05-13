/*
  Warnings:

  - A unique constraint covering the columns `[tutorId]` on the table `tutorInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tutorInfo_tutorId_key" ON "tutorInfo"("tutorId");
