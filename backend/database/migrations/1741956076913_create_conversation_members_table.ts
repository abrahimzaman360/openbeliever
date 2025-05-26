import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'conversation_members'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('conversation_id').references('id').inTable('conversations').onDelete('CASCADE').notNullable()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.boolean('is_deleted').defaultTo(false)
      table.primary(['conversation_id', 'user_id']) // Composite primary key
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
