import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'path_contents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('path_id').references('id').inTable('learning_paths').onDelete('CASCADE')
      table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE')
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.integer('order').notNullable()
      table.boolean('is_required').defaultTo(true)
      table.text('description')
      table.integer('estimated_duration')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
