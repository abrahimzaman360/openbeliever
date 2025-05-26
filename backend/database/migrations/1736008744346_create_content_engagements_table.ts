import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'content_engagements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE')
      table.integer('read_duration')
      table.boolean('is_completed').defaultTo(false)
      table.timestamp('start_time')
      table.timestamp('end_time')
      table.string('engagement_type')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
