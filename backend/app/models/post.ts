import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations';
import { DateTime } from 'luxon';
import User from './user.js';
import Topic from './topic.js';
import ContentEngagement from './content-engagement.js';
import Save from './save.js';
import Feedback from './feedback.js';
import PostLike from './post_like.js';
import PostFavorite from './post_favorite.js';
import PostShare from './post_share.js';
import { v7 as uuidv7 } from 'uuid';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  GIF = 'gif',
}

export default class Post extends BaseModel {
  @beforeCreate()
  static async generateUuid(post: Post) {
    post.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare content: string

  @column()
  declare topic: string

  @column()
  declare privacy: 'private' | 'public' | 'followers'

  @column({ serializeAs: 'attachments' })
  declare attachments: {
    gifs?: string[]
    images?: string[]
    videos?: string[]
  }

  @column()
  declare tags: string[]

  @column()
  declare metaData: {
    location?: {
      lat: number
      lng: number
      name: string
    }
    feeling?: string
    activity?: string
    originalPost?: string // For shared/reposted content
  }

  @column()
  declare estimatedReadTime: number

  @column()
  declare isPublished: boolean

  @column()
  declare qualityScore: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'post_tags',
    pivotColumns: ['position_x', 'position_y'],
  })
  declare taggedUsers: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'post_collaborators',
    pivotColumns: ['role', 'can_edit'],
  })
  declare collaborators: ManyToMany<typeof User>

  @manyToMany(() => Topic, {
    pivotTable: 'post_topics',
  })
  declare topics: ManyToMany<typeof Topic>

  @hasMany(() => ContentEngagement)
  declare engagements: HasMany<typeof ContentEngagement>

  @hasMany(() => Save)
  declare saves: HasMany<typeof Save>

  @hasMany(() => Feedback)
  declare feedback: HasMany<typeof Feedback>

  // Likes, Favorites, Shares, Comments, etc.
  @column()
  declare likesCount: number

  @column()
  declare favouritesCount: number

  @column()
  declare sharesCount: number

  @hasMany(() => PostLike)
  declare likes: HasMany<typeof PostLike>

  @hasMany(() => PostFavorite)
  declare favorites: HasMany<typeof PostFavorite>

  @hasMany(() => PostShare)
  declare shares: HasMany<typeof PostShare>
}
