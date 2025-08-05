-- CreateTable
CREATE TABLE "curso_moodle" (
    "id_curso_moodle" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "moodle_curso_id" INTEGER NOT NULL,
    "nombre_corto_moodle" VARCHAR(100) NOT NULL,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "curso_moodle_pkey" PRIMARY KEY ("id_curso_moodle")
);

-- CreateTable
CREATE TABLE "grupo_telegram" (
    "id_grupo_telegram" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "telegram_group_id" VARCHAR(50) NOT NULL,
    "nombre_grupo" VARCHAR(200) NOT NULL,
    "enlace_invitacion" VARCHAR(500) NOT NULL,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "grupo_telegram_pkey" PRIMARY KEY ("id_grupo_telegram")
);

-- CreateTable
CREATE TABLE "inscripcion_moodle" (
    "id_inscripcion_moodle" SERIAL NOT NULL,
    "id_inscripcion" INTEGER NOT NULL,
    "moodle_user_id" INTEGER NOT NULL,
    "moodle_username" VARCHAR(100) NOT NULL,
    "estado_matricula" VARCHAR(50) NOT NULL DEFAULT 'matriculado',
    "fecha_matricula" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6) NOT NULL,
    "notas" TEXT,

    CONSTRAINT "inscripcion_moodle_pkey" PRIMARY KEY ("id_inscripcion_moodle")
);

-- CreateIndex
CREATE UNIQUE INDEX "curso_moodle_id_curso_key" ON "curso_moodle"("id_curso");

-- CreateIndex
CREATE UNIQUE INDEX "grupo_telegram_id_curso_key" ON "grupo_telegram"("id_curso");

-- CreateIndex
CREATE UNIQUE INDEX "inscripcion_moodle_id_inscripcion_key" ON "inscripcion_moodle"("id_inscripcion");

-- AddForeignKey
ALTER TABLE "curso_moodle" ADD CONSTRAINT "curso_moodle_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_telegram" ADD CONSTRAINT "grupo_telegram_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripcion_moodle" ADD CONSTRAINT "inscripcion_moodle_id_inscripcion_fkey" FOREIGN KEY ("id_inscripcion") REFERENCES "inscripcion"("id_inscripcion") ON DELETE CASCADE ON UPDATE CASCADE;
