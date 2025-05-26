import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Post from './post.js'

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  VIOLENCE = 'violence',
  COPYRIGHT = 'copyright',
  IMPERSONATION = 'impersonation',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export default class Report extends BaseModel {
  [x: string]: any
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reporterId: string

  @column()
  declare reportableId: string

  @column()
  declare reportableType: string

  @column()
  declare reason: ReportReason

  @column()
  declare description: string | null

  @column()
  declare status: ReportStatus

  @column()
  declare adminNotes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare resolvedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'reporterId' })
  declare reporter: BelongsTo<typeof User>

  // Polymorphic relationships allow reporting different types of content
  reportable() {
    const model = {
      'App/Models/User': () => User,
      'App/Models/Post': () => Post,
    }[this.reportableType]

    return this.belongsTo(model, { foreignKey: 'reportableId' })
  }
}
