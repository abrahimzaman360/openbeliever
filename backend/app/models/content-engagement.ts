import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Post from './post.js'
import User from './user.js'

export default class ContentEngagement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare postId: string

  @column()
  declare readDuration: number

  @column()
  declare isCompleted: boolean

  @column.dateTime()
  declare startTime: DateTime

  @column.dateTime()
  declare endTime: DateTime

  @column()
  declare engagementType: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>
}
