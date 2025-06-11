<!-- filepath: c:\Users\OppaDev\Desktop\work-space\Sistema_Registro_CEPEIGE\README.md -->
# Sistema_Registro_CEPEIGE

Sistema de Registro para los cursos ofrecidos por CEPEIGE. Este proyecto está dividido en un backend y un frontend.

## Tecnologías Utilizadas

### Backend
- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- JWT para autenticación
- Winston para logging
- Multer para subida de archivos
- Jest para testing

### Frontend
- Next.js (con Turbopack)
- React
- TypeScript
- Tailwind CSS
- Shadcn/ui (para componentes UI)
- Zod para validación de esquemas
- Axios para peticiones HTTP
- React Hook Form para manejo de formularios

## Estructura del Proyecto

El repositorio está organizado en dos carpetas principales:

- `backend/`: Contiene el servidor API REST.
- `frontend/`: Contiene la aplicación cliente web.

Cada carpeta tiene su propio `README.md` con instrucciones específicas.

## Instalación

### Prerrequisitos
- Node.js (versión >=22.15.0 para el backend)
- npm o yarn
- PostgreSQL

### Backend
1. Navega a la carpeta `backend`: `cd backend`
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno. Crea un archivo `.env` basado en `.env.example` (si existe) o configura las siguientes variables:
   - `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"`
   - `JWT_SECRET="tu_secreto_jwt"`
   - `PORT=3001` (o el puerto que prefieras)
4. Ejecuta las migraciones de la base de datos: `npm run prisma:migrate`
5. (Opcional) Si necesitas datos iniciales: `npm run prisma:seed`

### Frontend
1. Navega a la carpeta `frontend`: `cd frontend`
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno si es necesario (por ejemplo, la URL del API backend).

## Uso

### Backend
- Para iniciar el servidor en modo desarrollo (con hot-reloading):
  `npm run dev`
- Para compilar el proyecto:
  `npm run build`
- Para iniciar el servidor en modo producción:
  `npm run start`

### Frontend
- Para iniciar el servidor de desarrollo:
  `npm run dev`
- Para compilar el proyecto para producción:
  `npm run build`
- Para iniciar el servidor de producción:
  `npm run start`

## Scripts Disponibles

### Backend (`backend/package.json`)
- `build`: Compila el código TypeScript.
- `start`: Inicia el servidor desde los archivos compilados.
- `dev`: Inicia el servidor en modo desarrollo usando `nodemon`.
- `dev:build`: Observa cambios en los archivos TypeScript y los recompila.
- `prisma:generate`: Genera el cliente Prisma.
- `prisma:migrate`: Ejecuta las migraciones de la base de datos.
- `prisma:reset`: Resetea la base de datos.
- `prisma:studio`: Abre Prisma Studio.
- `prisma:seed`: Ejecuta los scripts de seeding.
- `test`: Ejecuta las pruebas con Jest.
- `test:watch`: Ejecuta las pruebas en modo watch.
- `lint`: Revisa el código con ESLint.
- `lint:fix`: Revisa y corrige automáticamente problemas de ESLint.

### Frontend (`frontend/package.json`)
- `dev`: Inicia el servidor de desarrollo Next.js con Turbopack.
- `build`: Compila la aplicación Next.js para producción.
- `start`: Inicia el servidor de producción Next.js.
- `lint`: Revisa el código con Next.js ESLint.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.