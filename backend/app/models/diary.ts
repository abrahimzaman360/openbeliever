import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'

export default class Diary extends BaseModel {
  @beforeCreate()
  static async generateUuid(note: Diary) {
    note.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare userId: string;

  @column()
  declare title: string;

  @column()
  declare content: string;

  @column()
  declare date: DateTime;

  @column()
  declare isPinned: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
