import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Post from './post.js'

export default class Topic extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare icon: string

  @column()
  declare priorityLevel: number

  @manyToMany(() => Post, {
    pivotTable: 'post_topics',
  })
  declare posts: ManyToMany<typeof Post>
}
