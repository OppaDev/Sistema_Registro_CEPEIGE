/*
  Warnings:

  - A unique constraint covering the columns `[ci_pasaporte]` on the table `datos_personales` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "datos_personales_ci_pasaporte_key" ON "datos_personales"("ci_pasaporte");
