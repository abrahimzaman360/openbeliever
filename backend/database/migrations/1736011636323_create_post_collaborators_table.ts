import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_collaborators'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE')
      table.enum('role', ['author', 'editor', 'viewer']).defaultTo('author')
      table.boolean('can_edit').defaultTo(true)
      table.unique(['post_id', 'user_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
