# CEPEIGE Registration System - Backend

## Architecture Overview

This is a **Node.js/TypeScript/Express** backend for a course registration system using **Prisma ORM** with **PostgreSQL**. The system follows a **layered architecture** with strict separation of concerns.

### Core Structure
- **Controllers**: Handle HTTP requests/responses (`src/api/controllers/`)
- **Services**: Business logic layer (`src/api/services/`)
- **DTOs**: Data validation using `class-validator` (`src/api/dtos/`)
- **Mappers**: Transform Prisma models to DTOs (`src/api/services/mappers/`)
- **Middlewares**: Auth, validation, error handling (`src/api/middlewares/`)

### Key Patterns

#### Path Aliases
- Use `@/` for imports: `import { logger } from '@/utils/logger'`
- Configured in `tsconfig.json` and `package.json` (`_moduleAliases`)

#### Error Handling
- Custom error classes in `src/utils/errorTypes.ts`
- Global error handler in `src/api/middlewares/errorHandler.ts`
- Controllers use `next(error)` pattern for error propagation

#### Authentication & Authorization
- JWT-based auth with role-based permissions
- `authenticate` and `authorize` middlewares in `auth.middleware.ts`
- **Permission system**: `checkPermissions(['crear:usuario', 'leer:usuarios'])` 
- **Session management**: Refresh tokens stored in `SesionUsuario` model
- **Multiple sessions support**: Users can have multiple active sessions
- Global Request interface extended with `user` property
- Auth endpoints: `/login`, `/refresh`, `/logout`, `/logout-all`, `/profile`, `/sessions`

### Session Management Details
- **Refresh tokens**: Stored in `SesionUsuario` table with expiration
- **Multiple sessions**: Users can have multiple active sessions across devices
- **Session metadata**: Tracks IP address and user agent
- **Session endpoints**: `/auth/sessions` (list), `/auth/logout-all` (clear all)

#### Data Layer
- **Prisma ORM** with PostgreSQL
- Models: `Curso`, `DatosPersonales`, `DatosFacturacion`, `Inscripcion`, `Comprobante`, `Descuento`, `Usuario`, `Rol`, `Permiso`, `SesionUsuario`
- Complex relations with proper foreign key mappings
- **Role-based permissions system** with `Usuario`, `Rol`, `Permiso`, `UsuarioRol`, `RolPermiso`
- **Session management** with `SesionUsuario` for JWT refresh tokens
- Database migrations in `prisma/migrations/`

#### File Upload System
- **Multer configuration** in `src/config/multer.ts`
- File upload for payment receipts (`comprobantes`)
- Storage in `uploads/comprobantes/` directory
- File validation and secure naming
- Environment variables: `UPLOAD_PATH`, `MAX_FILE_SIZE_BYTES`

#### Validation
- Class-validator DTOs for request validation
- Custom validators in `src/utils/validators/` (e.g., `dateValidators.ts` for date comparisons)
- Validation middleware: `validate.dto.ts`

#### File Structure Convention
- Group by feature domain: `inscripcionController/`, `authController/`
- Each feature has: controller, service, DTOs, routes, mappers
- Centralized exports in `index.ts` files

## Development Workflow

```bash
# Database operations
npm run prisma:migrate    # Run migrations
npm run prisma:generate   # Generate Prisma client
npm run prisma:studio     # Open Prisma Studio
npm run prisma:seed       # Seed database

# Development
npm run dev               # Start with nodemon
npm run dev:build         # TypeScript watch mode
npm run build            # Production build
npm run test             # Run Jest tests
npm run test:watch       # Watch mode tests
```

## Key Implementation Details

### Controller Pattern
```typescript
// Controllers always use try-catch with next(error)
async create(req: Request, res: Response, next: NextFunction) {
  try {
    const data: CreateDto = req.body;
    const result = await service.create(data);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}
```

### Service Pattern
```typescript
// Services handle business logic and database operations
// Use Prisma transactions for complex operations
// Return mapped DTOs, not raw Prisma objects
```

### Mapper Pattern
```typescript
// Transform Prisma models to response DTOs
// Define strict types for Prisma relations
export type PrismaInscripcionConRelaciones = PrismaInscripcion & {
  curso: PrismaCurso;
  persona: PrismaDatosPersonales;
  // ... other relations
};
```

### Route Structure
- All routes under `/api/v1/` prefix
- Feature-grouped routes: `/inscripciones`, `/cursos`, `/auth`, `/usuarios`
- Protected routes use `authenticate` and `checkPermissions(['permiso:recurso'])` middlewares
- Auth routes: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/profile`
- User management: `/usuarios` (protected with role-based permissions)
- File upload endpoints for comprobantes (payment receipts)

## Critical Files
- `src/app.ts` - Application configuration
- `src/server.ts` - Server initialization
- `prisma/schema.prisma` - Database schema
- `src/api/routes/index.ts` - Route configuration
- `src/config/express.ts` - Express middleware setup

## Testing
- Jest with `ts-jest` preset
- Tests in `src/**/*.test.ts`
- Coverage reports in `coverage/`
- Module path mapping configured for tests

### Environment Variables
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **JWT**: `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- **Server**: `PORT`, `NODE_ENV`
- **File Upload**: `UPLOAD_PATH`, `MAX_FILE_SIZE_BYTES`
- **Rate Limiting**: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
- **Logging**: `LOG_LEVEL`, `LOG_FILE`

### API Documentation
- Health check endpoint: `/health`
- Root endpoint: `/` (API info)
- API documentation: `/api/docs` (configured in express.ts)
- Ping endpoint: `/api/v1/ping`

## Security & Middleware
- Helmet for security headers
- CORS configuration
- Rate limiting
- JWT authentication
- Request validation
- File upload handling with Multer (comprobantes)

When working with this codebase, always follow the established patterns for consistency and maintainability.
