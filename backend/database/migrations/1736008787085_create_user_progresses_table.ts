import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_progresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.integer('path_id').references('id').inTable('learning_paths').onDelete('CASCADE')
      table.float('completion_percentage').defaultTo(0)
      table.timestamp('last_activity')
      table.json('progress_data').defaultTo('{}')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
