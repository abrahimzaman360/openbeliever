import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import LearningPath from './learning-path.js'

export default class UserProgress extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare pathId: string

  @column()
  declare completionPercentage: number

  @column.dateTime()
  declare lastActivity: DateTime

  @column()
  declare progressData: JSON

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => LearningPath)
  declare learningPath: BelongsTo<typeof LearningPath>
}
