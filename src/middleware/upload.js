import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const storage = multer.memoryStorage();

const ALLOWED_MIMETYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(
      `Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan PNG, JPEG y WebP.`,
      400,
      true
    ), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024,
};

export const upload = multer({ storage, fileFilter, limits });

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(AppError.validation('El archivo supera el tamaño máximo permitido (5 MB)'));
    }
    return next(AppError.validation(`Error de subida: ${err.message}`));
  }
  next(err);
};
