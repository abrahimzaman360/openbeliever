import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Message from './message.js'
import User from '../user.js'
import { v7 as uuidv7 } from 'uuid';

export default class Conversation extends BaseModel {
  @beforeCreate()
  static async generateUuid(conversation: Conversation) {
    conversation.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: 'private' | 'group'

  @column()
  declare creatorId: string

  @column()
  declare receipientId: string | null // Nullable for groups

  @column()
  declare isArchived: boolean

  @column()
  declare isDeleted: boolean

  @column()
  declare lastMessageReadAt: DateTime | null

  @manyToMany(() => User, {
    pivotTable: 'conversation_members',
    pivotForeignKey: 'conversation_id',
    pivotRelatedForeignKey: 'user_id',
    pivotColumns: ['is_deleted'],
  })
  declare members: ManyToMany<typeof User>

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
