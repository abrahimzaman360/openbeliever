import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'time_trackings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('session_start')
      table.timestamp('session_end')
      table.integer('duration')
      table.string('activity_type')
      table.json('activity_data').defaultTo('{}')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
