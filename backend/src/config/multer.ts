// backend/src/config/multer.ts
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import {BadRequestError } from '@/utils/errorTypes'; // Usaremos BadRequestError aquí

// Directorio de subida desde variables de entorno o default
const UPLOAD_DIR_BASE = process.env['UPLOAD_PATH'] || './uploads';
const COMPROBANTES_SUBDIR = 'comprobantes';
const UPLOAD_DIR_COMPROBANTES = path.join(UPLOAD_DIR_BASE, COMPROBANTES_SUBDIR);

// MAX_FILE_SIZE ya no es MB, es el valor directo en bytes para multer
const MAX_FILE_SIZE_BYTES = parseInt(process.env['MAX_FILE_SIZE_BYTES'] || (5 * 1024 * 1024).toString()); // 5MB por defecto

// Asegurarse de que el directorio de subida exista
if (!fs.existsSync(UPLOAD_DIR_COMPROBANTES)) {
  fs.mkdirSync(UPLOAD_DIR_COMPROBANTES, { recursive: true });
}

// Configuración de almacenamiento de Multer
const storage: StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, UPLOAD_DIR_COMPROBANTES);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + crypto.getRandomValues(new Uint32Array(1))[0];
    const extension = path.extname(file.originalname);
    const originalNameWithoutExt = path.basename(file.originalname, extension);
    const safeOriginalName = originalNameWithoutExt.replace(/[^a-zA-Z0-9_.-]/g, '_').substring(0, 50);
    
    cb(null, `${safeOriginalName}-${uniqueSuffix}${extension}`);
  }
});

// Filtro de archivos
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Es importante que el error aquí sea uno que Multer pueda manejar o que se capture bien.
    // Un error simple es suficiente, el errorHandler lo puede tomar.
    cb(new BadRequestError('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG o PDF.'));
  }
};

export const uploadComprobanteMiddleware = multer({ // Renombrado para claridad
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  },
  fileFilter: fileFilter
});

// Helper para eliminar un archivo
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        // Si el archivo no existe, no es un error crítico en este contexto.
        if (err.code === 'ENOENT') {
          console.warn(`Intento de eliminar archivo no existente: ${filePath}`);
          return resolve();
        }
        console.error(`Error al eliminar archivo ${filePath}:`, err);
        return reject(err); // Puedes decidir si esto debe ser un error fatal o solo un log
      }
      resolve();
    });
  });
};