import express from 'express'
import { upload } from './src/config/multerConfig.js'
import sharp from 'sharp'
const app = express()
const PORT = 3000

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!')
})

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!')
})

app.post('/upload', upload.array('images'), async (req, res) => {
  const optimizedImages = await Promise.all(
    req.files.map(async file => {
      const optimizedImage = await sharp(file.buffer)
        .resize({ width: 1000, height: 1000, fit: 'inside' })
        .avif({ quality: 70, speed: 1 })
        .toBuffer()
      return optimizedImage
    })
  )

  res.set('Content-Type', 'image/avif')
  res.send(optimizedImages[0])
})

// app.post('/update-image/:product_id', upload.array('images'), async (req, res) => {
//   const productId = req.params.product_id
//   const updatedImages = await Promise.all(
//     req.files.map(async file => {
//       const updatedImage = await sharp(file.buffer)
//         .resize({ width: 800, height: 600 })
//         .webp({ quality: 80 })
//         .toBuffer()
//     })
//   )
//   res.send(`Imágenes actualizadas para el producto ${productId}`)
// }

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
