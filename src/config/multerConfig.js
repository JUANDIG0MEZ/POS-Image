import multer from 'multer'

import { MAX_FILE_SIZE_MB, MAX_UPLOAD_IMAGES } from './index.js'

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/bmp',
  'image/avif'
]

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(MAX_FILE_SIZE_MB) * 1024 * 1024,
    files: Number(MAX_UPLOAD_IMAGES)
  },
  fileFilter: (req, file, cb) => {
    if (!allowedImageTypes.includes(file.mimetype)) return cb(new Error('Tipo de archivo no permitido'))
    cb(null, true)
  }
})
