import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1),
    topic: vine.string().trim(),
    privacy: vine.enum(['private', 'public', 'followers']),
    tags: vine.string().optional(), // Changed to accept stringified JSON
    gifs: vine
      .array(
        vine.file({
          size: '15mb',
          extnames: ['gif'],
        })
      )
      .optional(),
    images: vine
      .array(
        vine.file({
          size: '15mb',
          extnames: ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'PNG', 'WEBP'],
        })
      )
      .optional(),
    videos: vine
      .array(
        vine.file({
          size: '200mb',
          extnames: ['mp4', 'webm'],
        })
      )
      .optional(),
  })
)

export const editPostValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1),
    topic: vine.string().trim(),
    privacy: vine.enum(['private', 'public', 'followers']),
    tags: vine.string().optional(), // Changed to accept stringified JSON
    gifs: vine
      .array(
        vine.file({
          size: '15mb',
          extnames: ['gif'],
        })
      )
      .optional(),
    images: vine
      .array(
        vine.file({
          size: '15mb',
          extnames: ['jpg', 'jpeg', 'png', 'webp'],
        })
      )
      .optional(),
    videos: vine
      .array(
        vine.file({
          size: '200mb',
          extnames: ['mp4', 'webm'],
        })
      )
      .optional(),
  })
)
