import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'media'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('message_id').references('id').inTable('messages').onDelete('CASCADE').notNullable()
      table.text('file_url').notNullable()
      table.enum('file_type', ['image', 'audio', 'video', 'file']).notNullable()
      table.bigInteger('file_size').notNullable()
      table.integer('duration').nullable()
      table.text('thumbnail_url').nullable()
      table.timestamp('created_at').defaultTo(this.now()).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
