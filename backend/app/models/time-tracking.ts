import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'

export default class TimeTracking extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column.dateTime()
  declare sessionStart: DateTime

  @column.dateTime()
  declare sessionEnd: DateTime

  @column()
  declare duration: number

  @column()
  declare activityType: string

  @column()
  declare activityData: JSON

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
