-- CreateTable
CREATE TABLE "curso" (
    "id_curso" SERIAL NOT NULL,
    "nombre_corto_curso" VARCHAR(100) NOT NULL,
    "nombre_curso" VARCHAR(100) NOT NULL,
    "descripcion_curso" TEXT NOT NULL,
    "valor_curso" DECIMAL(10,2) NOT NULL,
    "fecha_inicio_curso" DATE NOT NULL,
    "fecha_fin_curso" DATE NOT NULL,

    CONSTRAINT "curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "datos_personales" (
    "id_persona" SERIAL NOT NULL,
    "ci_pasaporte" VARCHAR(20) NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "num_telefono" VARCHAR(15) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "pais" VARCHAR(30) NOT NULL,
    "provincia_estado" VARCHAR(50) NOT NULL,
    "ciudad" VARCHAR(100) NOT NULL,
    "profesion" VARCHAR(100) NOT NULL,
    "institucion" VARCHAR(100) NOT NULL,

    CONSTRAINT "datos_personales_pkey" PRIMARY KEY ("id_persona")
);

-- CreateTable
CREATE TABLE "descuento" (
    "id_descuento" SERIAL NOT NULL,
    "tipo_descuento" VARCHAR(100) NOT NULL,
    "valor_descuento" DECIMAL(5,2) NOT NULL,
    "porcentaje_descuento" DECIMAL(5,2) NOT NULL,
    "descripcion_descuento" TEXT NOT NULL,

    CONSTRAINT "descuento_pkey" PRIMARY KEY ("id_descuento")
);

-- CreateTable
CREATE TABLE "datos_facturacion" (
    "id_facturacion" SERIAL NOT NULL,
    "razon_social" VARCHAR(100) NOT NULL,
    "identificacion_tributaria" VARCHAR(50) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "correo_factura" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(250) NOT NULL,

    CONSTRAINT "datos_facturacion_pkey" PRIMARY KEY ("id_facturacion")
);

-- CreateTable
CREATE TABLE "inscripcion" (
    "id_inscripcion" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "id_descuento" INTEGER,
    "id_facturacion" INTEGER NOT NULL,
    "matricula" BOOLEAN NOT NULL DEFAULT false,
    "fecha_inscripcion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripcion_pkey" PRIMARY KEY ("id_inscripcion")
);

-- CreateTable
CREATE TABLE "factura" (
    "id_factura" SERIAL NOT NULL,
    "id_inscripcion" INTEGER NOT NULL,
    "id_facturacion" INTEGER NOT NULL,
    "valor_pagado" DECIMAL(10,2) NOT NULL,
    "verificacion_pago" BOOLEAN NOT NULL,
    "numero_ingreso" VARCHAR(100) NOT NULL,
    "numero_factura" VARCHAR(100) NOT NULL,

    CONSTRAINT "factura_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "comprobante" (
    "id_comprobante" SERIAL NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "fecha_subida" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ruta_comprobante" VARCHAR(250) NOT NULL,
    "tipo_archivo" VARCHAR(50) NOT NULL,
    "nombre_archivo" VARCHAR(100) NOT NULL,

    CONSTRAINT "comprobante_pkey" PRIMARY KEY ("id_comprobante")
);

-- AddForeignKey
ALTER TABLE "inscripcion" ADD CONSTRAINT "inscripcion_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "inscripcion" ADD CONSTRAINT "inscripcion_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "datos_personales"("id_persona") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "inscripcion" ADD CONSTRAINT "inscripcion_id_descuento_fkey" FOREIGN KEY ("id_descuento") REFERENCES "descuento"("id_descuento") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "inscripcion" ADD CONSTRAINT "inscripcion_id_facturacion_fkey" FOREIGN KEY ("id_facturacion") REFERENCES "datos_facturacion"("id_facturacion") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_inscripcion_fkey" FOREIGN KEY ("id_inscripcion") REFERENCES "inscripcion"("id_inscripcion") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_facturacion_fkey" FOREIGN KEY ("id_facturacion") REFERENCES "datos_facturacion"("id_facturacion") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "comprobante" ADD CONSTRAINT "comprobante_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "factura"("id_factura") ON DELETE RESTRICT ON UPDATE RESTRICT;
