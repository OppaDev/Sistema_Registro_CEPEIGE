/*
  Warnings:

  - Made the column `id_comprobante` on table `inscripcion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "inscripcion" DROP CONSTRAINT "inscripcion_id_comprobante_fkey";

-- AlterTable
ALTER TABLE "inscripcion" ALTER COLUMN "id_comprobante" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "inscripcion" ADD CONSTRAINT "inscripcion_id_comprobante_fkey" FOREIGN KEY ("id_comprobante") REFERENCES "comprobante"("id_comprobante") ON DELETE RESTRICT ON UPDATE RESTRICT;
