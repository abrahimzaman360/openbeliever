import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS "pgcrypto"').knexQuery

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery).unique()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.text('content').notNullable()
      table.string('topic').notNullable()
      table.enum('privacy', ['private', 'public', 'followers']).defaultTo('public')
      table.string('tags').defaultTo('[]')
      table.json('attachments').nullable()
      table.integer('estimated_read_time').defaultTo(0)
      table.boolean('is_published').defaultTo(false)
      table.json('engagements').defaultTo('{}')
      table.json('meta_data').defaultTo('{}')
      table.float('quality_score').defaultTo(0)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
