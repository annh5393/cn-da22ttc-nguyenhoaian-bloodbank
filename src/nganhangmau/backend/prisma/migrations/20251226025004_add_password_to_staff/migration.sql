/*
  Warnings:

  - A unique constraint covering the columns `[emailnv]` on the table `nhanvienyte` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "nhanvienyte" ADD COLUMN     "password" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "nhanvienyte_emailnv_key" ON "nhanvienyte"("emailnv");
