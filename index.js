import express from 'express'
import multer from 'multer'

const app = express()
const PORT = 3000

const upload = multer()

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/bmp',
  'image/avif'
]

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!')
})

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
