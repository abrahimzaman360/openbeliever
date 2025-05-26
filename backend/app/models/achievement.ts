import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Achievement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare icon: string

  @column()
  declare category: string

  @column()
  declare criteria: JSON

  @manyToMany(() => User, {
    pivotTable: 'user_achievements',
    pivotColumns: ['earned_at', 'achievement_data'],
  })
  declare users: ManyToMany<typeof User>
}


