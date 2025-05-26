import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class E2EKey extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare conversationId: string

  @column()
  declare userId: string

  @column()
  declare publicKey: string

  @column()
  declare privateKey: string

  @column()
  declare sharedSecret: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
