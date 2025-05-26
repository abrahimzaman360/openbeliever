import sharp from 'sharp'
import drive from '@adonisjs/drive/services/main'
import env from '#start/env'
import { cuid } from '@adonisjs/core/helpers'

interface ImageVariant {
  width: number
  height: number
  quality: number
  suffix: string
}

export default class MultiImageVariantsService {
  // Example variants: 200px wide thumbnail, 800px medium, original max for large
  private variants: ImageVariant[] = [
    { width: 200, height: 200, quality: 80, suffix: '_thumb' },
    { width: 800, height: 800, quality: 85, suffix: '_medium' },
    // For the largest, use a more generous size or detect from metadata dynamically
    { width: 1920, height: 1920, quality: 90, suffix: '_large' },
  ]

  public async generate(file: any, postId: string | number) {
    const fileClientName = file.clientName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-.]/g, '')
    const fileNameBase = `/posts/${postId}/images/${cuid()}-${fileClientName.split('.')[0]}`

    // Collect paths for each variant
    const variantPaths: string[] = []

    // Read the file data from temp path
    const inputBuffer = await file.tmpPath

    for (const variant of this.variants) {
      const resizedBuffer = await sharp(inputBuffer)
        .rotate(0)
        .resize(variant.width, variant.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: variant.quality })
        .toBuffer()

      // Example: /images/123abc/xodoro-IMG2506_thumb.jpeg
      const variantFileName = `${fileNameBase}${variant.suffix}.jpeg`
      await drive.use(env.get('DRIVE_DISK')).put(variantFileName, resizedBuffer)
      variantPaths.push(variantFileName)
    }

    return variantPaths
  }
}
