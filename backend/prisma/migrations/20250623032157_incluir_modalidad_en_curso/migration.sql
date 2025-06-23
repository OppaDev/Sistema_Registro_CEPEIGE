/*
  Warnings:

  - Added the required column `modalidad_curso` to the `curso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "curso" ADD COLUMN     "modalidad_curso" VARCHAR(50) NOT NULL;
