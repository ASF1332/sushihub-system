-- AlterTable
ALTER TABLE "Insumo" ADD COLUMN     "preco" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "precoPromocional" DOUBLE PRECISION;
