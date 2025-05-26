import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_shares'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE')
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('shared_to').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
