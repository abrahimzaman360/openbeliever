import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import UserProgress from './user-progress.js'
import PathContent from './path-content.js'

export default class LearningPath extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare difficultyLevel: number

  @column()
  declare createdById: string

  @column()
  declare prerequisites: JSON

  @belongsTo(() => User, {
    foreignKey: 'createdById',
  })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => PathContent)
  declare content: HasMany<typeof PathContent>

  @hasMany(() => UserProgress)
  declare progress: HasMany<typeof UserProgress>
}
