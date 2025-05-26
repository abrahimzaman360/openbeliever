import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import Message from './message.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import { DateTime } from 'luxon';
import { v7 as uuidv7 } from 'uuid';

export default class Media extends BaseModel {
  @beforeCreate()
  static async generateUuid(media: Media) {
    media.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare messageId: string

  @column()
  declare fileUrl: string

  @column()
  declare fileType: 'image' | 'audio' | 'video' | 'file'

  @column()
  declare fileSize: number

  @column()
  declare duration: number | null // Nullable for non-audio/video

  @column()
  declare thumbnailUrl: string | null // Added for consistency with migration

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Message)
  declare message: BelongsTo<typeof Message>
}
