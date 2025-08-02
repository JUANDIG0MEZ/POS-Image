import multer from 'multer'

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/bmp',
  'image/avif'
]

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024 // Default: 5 MB
  }
})

module.exports = { upload, allowedImageTypes }
