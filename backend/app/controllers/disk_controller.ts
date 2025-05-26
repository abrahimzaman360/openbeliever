import drive from '@adonisjs/drive/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import env from '#start/env'
import { validateUploadedFiles } from '#validators/disk'


export default class DiskController {
  public async store({ request, response }: HttpContext) {
    const files = request.files('files')

    // Verify if files are present
    if (!files) {
      return response.badRequest({ message: 'No files provided' })
    }

    try {
      // Validate files
      const validatedFiles = await validateUploadedFiles.validate(files)

      // Upload files to disk
      const uploadedFiles = await Promise.all(
        validatedFiles.map(async (file) => {
          const filename = `${cuid()}.${file.extname}`
          const key = `messages/${filename}`

          // Upload the file
          await file.moveToDisk(key, env.get('DRIVE_DISK'))

          // Get the public URL
          const url = await drive.use(env.get('DRIVE_DISK')).getUrl(key)

          // Determine file type
          let type: "image" | "video" | "audio" | "file" = "file"
          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file?.extname!.toLowerCase())) {
            type = "image"
          } else if (['mp4', 'webm', 'mov'].includes(file?.extname!.toLowerCase())) {
            type = "video"
          } else if (['mp3', 'wav', 'ogg'].includes(file?.extname!.toLowerCase())) {
            type = "audio"
          }

          // Return in the format expected by MessageAttachment
          return {
            type,
            url,
            name: file.clientName,
            size: file.size
          }
        })
      )

      return response.ok({ files: uploadedFiles })
    } catch (error) {
      return response.badRequest({
        message: 'Invalid file type or size',
        errors: error.messages || error.message
      })
    }
  }

  async download({ params, response, auth }: HttpContext) {
    try {
      await auth.authenticate().then(async () => {
        const filePath = `storage/${params.fileName}`
        const url = await drive.use(env.get('DRIVE_DISK')).getUrl(filePath)

        return response.download(url)
      }).catch((error) => {
        return response.status(500).json({ message: "Internal server error", error: error.message })
      })
    } catch (error) {
      return response.status(500).json({ message: "Download failed" });
    }
  }
}
