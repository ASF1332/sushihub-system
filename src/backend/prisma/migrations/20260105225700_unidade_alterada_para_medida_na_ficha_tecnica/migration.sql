/*
  Warnings:

  - You are about to drop the column `unidade` on the `FichaTecnica` table. All the data in the column will be lost.
  - Added the required column `medida` to the `FichaTecnica` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FichaTecnica" DROP COLUMN "unidade",
ADD COLUMN     "medida" TEXT NOT NULL;
