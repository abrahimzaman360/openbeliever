import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import LearningPath from './learning-path.js'
import Post from './post.js'

export default class PathContent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pathId: string

  @column()
  declare postId: string

  @column()
  declare order: number

  @column()
  declare isRequired: boolean

  @column()
  declare description: string

  @column()
  declare estimatedDuration: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => LearningPath)
  declare learningPath: BelongsTo<typeof LearningPath>

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>
}
