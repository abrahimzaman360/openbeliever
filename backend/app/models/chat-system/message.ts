import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Conversation from './conversation.js'
import User from '../user.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import MessagesMedia from './media.js';
import { v7 as uuidv7 } from 'uuid';

export default class Message extends BaseModel {
  @beforeCreate()
  static async generateUuid(message: Message) {
    message.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare conversationId: string

  @column()
  declare senderId: string

  @column()
  declare content: string // Encrypted message content

  @column()
  declare messageType: 'text' | 'image' | 'audio' | 'video' | 'file'

  @column()
  declare status: 'sent' | 'delivered' | 'seen'

  @column()
  declare readAt: DateTime | null

  @column()
  declare isEdited: boolean

  @column()
  declare isPinned: boolean

  @column()
  declare isDeleted: boolean

  @belongsTo(() => User)
  declare sender: BelongsTo<typeof User>

  @belongsTo(() => Conversation)
  declare conversation: BelongsTo<typeof Conversation>

  @hasMany(() => MessagesMedia)
  declare media: HasMany<typeof MessagesMedia>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
