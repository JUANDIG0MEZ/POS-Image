import express from 'express'
import cors from 'cors'

import { upload } from './src/config/multerConfig.js'
import { PORT, URL_FRONTEND } from './src/config/index.js'

import { optimizeImage, saveImageKey, uploadImageToR2, verifyImages, verifyToken } from './src/controllers/uploadProductImages.js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const app = express()
console.log('URL_FRONTEND:', URL_FRONTEND)
app.use(cors({
  origin: URL_FRONTEND, // Your frontend's origin
  credentials: true
}))

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!')
})

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!')
})

app.post('/upload', upload.array('images'), async (req, res) => {
  try {
    const token = req.body.token
    const { imagesInfo, productId, idUser } = await verifyToken({ token })
    const imagesVerification = verifyImages({ images: req.files, imagesTokenInfo: imagesInfo })
    if (!imagesVerification) throw new Error('Error of verification')

    const baseKey = `products/user/${idUser}/product/${productId}`

    const keysUploadedR2 = await Promise.all(
      req.files.map(async file => {
        const optimizedImageBuffer = await optimizeImage({ imageBuffer: file.buffer })
        const keyR2 = await uploadImageToR2({ imageBuffer: optimizedImageBuffer, baseKey })
        const saved = await saveImageKey({ key: keyR2, productId, idUser })

        console.log(`Imagen subida a R2: ${keyR2}, guardada en la base de datos: ${saved}`)
        if (!saved) return null
        return keyR2
      })
    )

    const countUploadedImages = keysUploadedR2.filter(key => key !== null).length
    res.send(JSON.stringify({ message: `Imágenes subidas a R2: ${countUploadedImages} archivos.`, keys: keysUploadedR2 }))
  } catch (error) {
    console.error('Error en la carga de imágenes:', error)
    res.status(500).send('Error en la carga de imágenes')
  }
})

app.listen(PORT, () => {
  console.log(`PORT: ${PORT}`)
  console.log('Servidor escuchando en https://image.poscolombia.com.co')
})
