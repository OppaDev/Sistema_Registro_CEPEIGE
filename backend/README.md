# Sistema de Registro CEPEIGE - Backend

Sistema de gestión de inscripciones para cursos del Centro de Posgrado e Investigación en Gestión Empresarial (CEPEIGE), desarrollado con Node.js, TypeScript, Express y Prisma.

## 🚀 Características

- **API REST** con Express y TypeScript
- **Base de datos PostgreSQL** con Prisma ORM
- **Autenticación JWT** con roles y permisos
- **Validación de datos** con class-validator
- **Manejo de archivos** (comprobantes de pago)
- **Arquitectura por capas** (Controllers, Services, DTOs, Mappers)
- **Testing** con Jest
- **Logging** con Winston
- **Documentación** de API

## 📋 Requisitos

- Node.js >= 22.15.0
- PostgreSQL >= 13
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd Sistema_Registro_CEPEIGE/backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Opcional: Poblar con datos iniciales
npm run prisma:seed
```

## 🏃‍♂️ Ejecución

### Desarrollo

```bash
# Servidor de desarrollo con hot reload
npm run dev

# Compilación en modo watch
npm run dev:build
```

### Producción

```bash
# Construir proyecto
npm run build

# Ejecutar en producción
npm start
```

## 🗄️ Base de Datos

### Comandos Prisma

```bash
# Generar cliente Prisma
npm run prisma:generate

# Aplicar cambios al schema (desarrollo)
npm run prisma:migrate

# Interfaz visual de la BD
npm run prisma:studio

# Resetear BD (¡cuidado!)
npm run prisma:reset

# Poblar con datos iniciales
npm run prisma:seed
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

## 📁 Estructura del Proyecto

```text
src/
├── api/
│   ├── controllers/     # Controladores HTTP
│   ├── services/        # Lógica de negocio
│   ├── dtos/           # Validación de datos
│   ├── middlewares/    # Middlewares (auth, validation, etc.)
│   └── routes/         # Definición de rutas
├── config/             # Configuraciones (DB, JWT, Express)
├── utils/              # Utilidades y helpers
├── types/              # Tipos TypeScript
└── constants/          # Constantes globales
```

## 🔐 Autenticación

El sistema utiliza JWT con roles:

- **ADMIN**: Acceso completo
- **USER**: Acceso limitado a operaciones básicas

### Endpoints principales

- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `GET /api/v1/auth/profile` - Perfil del usuario

## 📊 Modelos Principales

- **Curso**: Información de cursos disponibles
- **DatosPersonales**: Información personal de estudiantes
- **DatosFacturacion**: Datos de facturación
- **Inscripcion**: Registro de inscripciones
- **Comprobante**: Comprobantes de pago
- **Usuario**: Usuarios del sistema
- **Rol**: Roles y permisos

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/cepeige_db"

# JWT
JWT_SECRET="tu-secret-key"
JWT_EXPIRES_IN="24h"

# Servidor
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

Una vez ejecutado el servidor, la documentación estará disponible en:

- **Swagger UI**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/v1/ping`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

**OppaDev** - Desarrollador principal