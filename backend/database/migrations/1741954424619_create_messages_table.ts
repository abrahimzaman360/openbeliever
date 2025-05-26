import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('conversation_id').references('id').inTable('conversations').onDelete('CASCADE').notNullable()
      table.uuid('sender_id').references('id').inTable('users').onDelete('SET NULL').notNullable()
      table.text('content').notNullable() // Encrypted content
      table.enum('message_type', ['text', 'image', 'audio', 'video', 'file']).defaultTo('text').notNullable()
      table.enum('status', ['sent', 'delivered', 'seen']).defaultTo('sent').notNullable()
      table.timestamp('read_at').nullable()
      table.boolean('is_edited').defaultTo(false)
      table.boolean('is_pinned').defaultTo(false)
      table.boolean('is_deleted').defaultTo(false)
      table.timestamp('created_at').defaultTo(this.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.now()).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
