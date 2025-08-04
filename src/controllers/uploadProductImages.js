import { s3Client } from '../config/r2.js'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { JWT_SECRET, R2_BUCKET_NAME, URL_API } from '../config/index.js'

import sharp from 'sharp'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { agent } from '../../index.js'

export async function verifyToken ({ token }) {
  try {
    const payload = await jwt.verify(token, JWT_SECRET)
    return payload
  } catch (error) {
    throw new Error('Token inválido o expirado')
  }
}

export async function verifyImages ({ images, imagesTokenInfo }) {
  const errorVerification = images.some((image) => {
    if (image.size > imagesTokenInfo.size) return true
    if (image.type !== imagesTokenInfo.type) return true
    if (image.name !== imagesTokenInfo.name) return true
    return false
  })

  if (errorVerification) throw new Error('Images do not match')

  return true
}

export async function optimizeImage ({ imageBuffer }) {
  const optimizedImageBuffer = await sharp(imageBuffer)
    .resize({ width: 1000, height: 1000, fit: 'inside' })
    .avif({ quality: 70, speed: 1 })
    .toBuffer()

  return optimizedImageBuffer
}

export async function uploadImageToR2 ({ imageBuffer, baseKey }) {
  const key = `${baseKey}/${crypto.randomUUID()}.avif` // Define el nombre del archivo en R2
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: imageBuffer,
    ContentType: 'image/avif'
  })

  await s3Client.send(command)
  return key
}

export async function saveImageKey ({ key, productId, idUser }) {
  try {
    console.log('ruta', `${URL_API}/v1/imagenes/product/save-key`, 'key', key, 'productId', productId, 'idUser', idUser)
    const response = await fetch(`${URL_API}/v1/imagenes/product/save-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key, productId, idUser }),
      dispacher: { agent }
    })

    console.log('response :', response)

    if (!response.ok) {
      throw new Error('Error al guardar la clave de la imagen')
    }
    return true
  } catch (error) {
    console.log('error', error)
    return false
  }
}
