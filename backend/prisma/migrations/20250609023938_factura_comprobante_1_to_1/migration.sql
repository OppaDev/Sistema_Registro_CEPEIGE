/*
  Warnings:

  - You are about to drop the column `id_factura` on the `comprobante` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_comprobante]` on the table `factura` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_comprobante` to the `factura` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comprobante" DROP CONSTRAINT "comprobante_id_factura_fkey";

-- AlterTable
ALTER TABLE "comprobante" DROP COLUMN "id_factura";

-- AlterTable
ALTER TABLE "factura" ADD COLUMN     "id_comprobante" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "factura_id_comprobante_key" ON "factura"("id_comprobante");

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_comprobante_fkey" FOREIGN KEY ("id_comprobante") REFERENCES "comprobante"("id_comprobante") ON DELETE RESTRICT ON UPDATE RESTRICT;
