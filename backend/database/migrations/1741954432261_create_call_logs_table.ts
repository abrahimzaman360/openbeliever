import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'call_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('conversation_id').references('id').inTable('conversations').onDelete('CASCADE')
      table.uuid('caller_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('receiver_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('call_type').notNullable() // audio | video
      table.string('call_status').notNullable() // ongoing | missed | ended
      table.integer('call_duration').nullable()
      table.timestamp('started_at')
      table.timestamp('ended_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
