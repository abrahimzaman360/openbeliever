import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'conversations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.enum('type', ['private', 'group']).notNullable()
      table.uuid('creator_id').references('id').inTable('users').onDelete('SET NULL')
      table.uuid('receipient_id').references('id').inTable('users').onDelete('SET NULL').nullable() // Nullable for groups
      table.boolean('is_archived').defaultTo(false)
      table.boolean('is_deleted').defaultTo(false)
      table.timestamp('last_message_read_at').nullable()
      table.timestamp('created_at').defaultTo(this.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.now()).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
