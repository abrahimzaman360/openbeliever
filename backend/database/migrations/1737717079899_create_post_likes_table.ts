import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_likes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE')
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Composite unique index to prevent duplicate likes
      table.unique(['post_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
