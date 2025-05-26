import sharp from 'sharp'

export default class ImageCompressionService {
  private readonly quality = 80
  private readonly width = 1024
  private readonly height = 1024

  async compressImage(file: any) {
    const buffer = await file.tmpPath
    const compressed = await sharp(buffer)
      .resize(this.width, this.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: this.quality,
        progressive: true,
        chromaSubsampling: '4:4:4',
      })
      .toBuffer()

    return compressed
  }

  async flipImage(file: any) {
    const buffer = await file.tmpPath
    const flipped = await sharp(buffer).flip().toBuffer()
    return flipped
  }
}
