import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'saves'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE')
      table.string('collection_name')
      table.timestamp('saved_at')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
