import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class CallLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare conversationId: string

  @column()
  declare callerId: string

  @column()
  declare receiverId: string

  @column()
  declare callType: 'audio' | 'video'

  @column()
  declare callStatus: 'ongoing' | 'missed' | 'ended'

  @column()
  declare callDuration: number

  @column.dateTime({ autoCreate: true })
  declare startedAt: DateTime

  @column()
  declare endedAt: Date
}
