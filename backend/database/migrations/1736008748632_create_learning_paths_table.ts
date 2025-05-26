import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'learning_paths'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.text('description')
      table.integer('difficulty_level')
      table.uuid('created_by_id').references('id').inTable('users').onDelete('SET NULL')
      table.json('prerequisites').defaultTo('{}')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
