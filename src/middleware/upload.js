import multer from 'multer';
import { AppError } from '../utils/AppError.js';

// Usamos memoryStorage para pasar el buffer directamente a Cloudinary/Sharp
const storage = multer.memoryStorage();

// 🐛 BUG 4: fileFilter acepta cualquier mimetype sin restricción.
// Debería rechazar archivos que no sean image/png, image/jpeg o image/webp.
// Se corrige en el commit de fix correspondiente.
const fileFilter = (req, file, cb) => {
  cb(null, true); // acepta todo — cualquier archivo pasa
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

export const upload = multer({ storage, fileFilter, limits });

/**
 * Middleware de error específico para Multer.
 * Se añade después del handler de ruta que use upload.*
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(AppError.validation('El archivo supera el tamaño máximo permitido (5 MB)'));
    }
    return next(AppError.validation(`Error de subida: ${err.message}`));
  }
  next(err);
};
