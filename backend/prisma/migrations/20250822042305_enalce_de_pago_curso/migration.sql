/*
  Warnings:

  - Added the required column `enlace_pago` to the `curso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "curso" ADD COLUMN     "enlace_pago" VARCHAR(255) NOT NULL;
