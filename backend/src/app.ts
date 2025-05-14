import express, { Application, Request, Response, NextFunction } from 'express';
import { PORT } from './config'; // Asumiendo que lo exportas desde config/index.ts
import exampleRoutes from './api/example.routes';
import formDataRoutes from './api/formData.routes';
import cors from 'cors';

// Importa tus rutas aquí (ejemplo)
// import authRoutes from './api/auth.routes';

const app: Application = express();

// Middlewares básicos
app.use(express.json()); // Para parsear JSON bodies
app.use(express.urlencoded({ extended: true })); // Para parsear URL-encoded bodies

// Configurar CORS
app.use(cors());

// Rutas de la API (ejemplo)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// app.use('/api/v1/auth', authRoutes);
// ... otras rutas

app.use('/api/v1/example', exampleRoutes);
app.use('/api', formDataRoutes);

// Middleware de manejo de errores (ejemplo básico)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;