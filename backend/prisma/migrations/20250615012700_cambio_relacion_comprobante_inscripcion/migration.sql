/*
  Warnings:

  - You are about to drop the column `id_comprobante` on the `factura` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_comprobante]` on the table `inscripcion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "factura" DROP CONSTRAINT "factura_id_comprobante_fkey";

-- DropIndex
DROP INDEX "factura_id_comprobante_key";

-- AlterTable
ALTER TABLE "factura" DROP COLUMN "id_comprobante";

-- AlterTable
ALTER TABLE "inscripcion" ADD COLUMN     "id_comprobante" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "inscripcion_id_comprobante_key" ON "inscripcion"("id_comprobante");

-- AddForeignKey
ALTER TABLE "inscripcion" ADD CONSTRAINT "inscripcion_id_comprobante_fkey" FOREIGN KEY ("id_comprobante") REFERENCES "comprobante"("id_comprobante") ON DELETE SET NULL ON UPDATE RESTRICT;
