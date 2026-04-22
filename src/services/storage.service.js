import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import config from '../config/index.js';

// Configuración de Cloudinary — se inyecta desde variables de entorno
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key:    config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

/**
 * Optimiza una imagen con Sharp y la sube a Cloudinary.
 * @param {Buffer} buffer  - Buffer del archivo recibido (memoryStorage)
 * @param {string} folder  - Carpeta destino en Cloudinary (ej. 'signatures')
 * @param {string} publicId - Identificador único dentro de la carpeta
 * @returns {Promise<string>} URL segura del recurso subido
 */
export const uploadImage = async (buffer, folder, publicId) => {
  // Optimización con Sharp: convertir a webp, reducir calidad
  const optimized = await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // Subida a Cloudinary usando stream desde buffer
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id:      publicId,
        resource_type:  'image',
        overwrite:      true,
        format:         'webp',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(optimized);
  });
};

/**
 * Sube un PDF (Buffer) a Cloudinary como raw.
 * @param {Buffer} buffer
 * @param {string} folder
 * @param {string} publicId
 * @returns {Promise<string>} URL segura del PDF subido
 */
export const uploadPdf = async (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id:     publicId,
        resource_type: 'raw',
        overwrite:     true,
        format:        'pdf',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Elimina un recurso de Cloudinary dado su publicId completo.
 * @param {string} publicId - p.ej. 'signatures/note_abc123'
 * @param {'image'|'raw'} resourceType
 */
export const deleteResource = async (publicId, resourceType = 'image') => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
