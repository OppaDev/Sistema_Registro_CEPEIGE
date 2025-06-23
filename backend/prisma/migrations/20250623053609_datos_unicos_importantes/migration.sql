/*
  Warnings:

  - A unique constraint covering the columns `[identificacion_tributaria]` on the table `datos_facturacion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[correo_factura]` on the table `datos_facturacion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[correo]` on the table `datos_personales` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numero_ingreso]` on the table `factura` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numero_factura]` on the table `factura` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "datos_facturacion_identificacion_tributaria_key" ON "datos_facturacion"("identificacion_tributaria");

-- CreateIndex
CREATE UNIQUE INDEX "datos_facturacion_correo_factura_key" ON "datos_facturacion"("correo_factura");

-- CreateIndex
CREATE UNIQUE INDEX "datos_personales_correo_key" ON "datos_personales"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "factura_numero_ingreso_key" ON "factura"("numero_ingreso");

-- CreateIndex
CREATE UNIQUE INDEX "factura_numero_factura_key" ON "factura"("numero_factura");
