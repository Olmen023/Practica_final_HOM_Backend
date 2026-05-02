import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import config from '../config/index.js';
import { AppError } from '../utils/AppError.js';

const cloudinaryConfigured = !!(
  config.CLOUDINARY_CLOUD_NAME &&
  config.CLOUDINARY_API_KEY    &&
  config.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key:    config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
}

export const uploadImage = async (buffer, folder, publicId) => {
  if (!cloudinaryConfigured) {
    throw new AppError(
      'Cloudinary no está configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el .env',
      503,
      true
    );
  }

  const optimized = await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

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

export const uploadPdf = async (buffer, folder, publicId) => {
  if (!cloudinaryConfigured) {
    throw new AppError(
      'Cloudinary no está configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el .env',
      503,
      true
    );
  }

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

export const deleteResource = async (publicId, resourceType = 'image') => {
  if (!cloudinaryConfigured) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
