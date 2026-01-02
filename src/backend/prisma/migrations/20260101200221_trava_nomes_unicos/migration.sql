/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Insumo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Insumo_nome_key" ON "Insumo"("nome");
