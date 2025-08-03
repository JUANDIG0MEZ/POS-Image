import express from 'express'
import cors from 'cors'
import https from 'https'
import fs from 'fs'

import { upload } from './src/config/multerConfig.js'
import { PORT } from './src/config/index.js'

import { optimizeImage, uploadImageToR2, verifyImages, verifyToken } from './src/controllers/uploadProductImages.js'

const app = express()
app.use(cors({
  origin: 'https://app.midominio.com:5173', // Your frontend's origin
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
    const token = req.headers.authorization?.split(' ')[1]
    const { imagesInfo, productId, idUser } = await verifyToken({ token })
    const imagesVerification = verifyImages({ images: req.files, imagesTokenInfo: imagesInfo })
    if (!imagesVerification) throw new Error('Error of verification')

    const baseKey = `products/user/${idUser}/product/${productId}`

    const keysUploadedR2 = await Promise.all(
      req.files.map(async file => {
        const optimizedImageBuffer = await optimizeImage({ imageBuffer: file.buffer })
        const keyR2 = await uploadImageToR2({ imageBuffer: optimizedImageBuffer, baseKey })
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

const sslOptions = {
  key: fs.readFileSync('./certs/image.midominio.com-key.pem'),
  cert: fs.readFileSync('./certs/image.midominio.com.pem')
}

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Servidor HTTPS escuchando en https://image.midominio.com:${PORT}`)
})
