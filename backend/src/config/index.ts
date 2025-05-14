import dotenv from 'dotenv';

dotenv.config(); // Carga variables desde .env

export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL;
// ... otras variables de entorno