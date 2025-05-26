import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Who made the report
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')

      // What's being reported (polymorphic relationship)
      table.uuid('reportable_id')
      table.string('reportable_type')

      // Report details
      table
        .enum('reason', [
          'spam',
          'harassment',
          'hate_speech',
          'inappropriate_content',
          'violence',
          'copyright',
          'impersonation',
          'other',
        ])
        .notNullable()

      table.text('description').nullable()
      table.enum('status', ['pending', 'reviewing', 'resolved', 'dismissed']).defaultTo('pending')
      table.text('admin_notes').nullable()

      table.timestamp('created_at')
      table.timestamp('resolved_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
