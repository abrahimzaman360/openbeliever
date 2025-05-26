import { BaseModel, beforeCreate, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import Post from './post.js'
import ContentEngagement from './content-engagement.js'
import TimeTracking from './time-tracking.js'
import UserProgress from './user-progress.js'
import Feedback from './feedback.js'
import Save from './save.js'
import Achievement from './achievement.js'
import Notification from './notification.js'
import Conversation from './chat-system/conversation.js'
import { v7 as uuidv7 } from 'uuid';


const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @beforeCreate()
  static async generateUuid(user: User) {
    user.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string | null

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare bio: string

  @column()
  declare link: string

  @column()
  declare gender: string

  @column()
  declare dateOfBirth: DateTime

  @column()
  declare country: string

  @column()
  declare isPrivate: boolean

  @column()
  declare isAdmin: boolean

  @column()
  declare productivityScore: number

  @column()
  declare learningScore: number

  @column()
  declare impactScore: number

  @column()
  declare isEmailVerified: boolean

  @column()
  declare isBlueVerified: boolean

  @column()
  declare avatar: string | null

  @column()
  declare coverImage: string | null

  @column()
  declare preferences: JSON

  @column()
  declare socialLinks: JSON

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare lastActive: DateTime

  @hasMany(() => Post)
  declare posts: HasMany<typeof Post>

  @hasMany(() => ContentEngagement)
  declare engagements: HasMany<typeof ContentEngagement>

  @hasMany(() => Save)
  declare saves: HasMany<typeof Save>

  @hasMany(() => Feedback)
  declare feedback: HasMany<typeof Feedback>

  @hasMany(() => UserProgress)
  declare progress: HasMany<typeof UserProgress>

  @hasMany(() => TimeTracking)
  declare timeTracking: HasMany<typeof TimeTracking>

  @hasMany(() => Notification)
  declare notifications: HasMany<typeof Notification>

  @manyToMany(() => Post, {
    pivotTable: 'post_collaborators',
    pivotColumns: ['role', 'can_edit'],
  })
  declare collaborativePosts: ManyToMany<typeof Post>

  @manyToMany(() => Achievement, {
    pivotTable: 'user_achievements',
    pivotColumns: ['earned_at', 'achievement_data'],
  })
  declare achievements: ManyToMany<typeof Achievement>

  @manyToMany(() => Conversation, {
    pivotTable: 'conversation_members',
  })
  declare conversations: ManyToMany<typeof Conversation>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
