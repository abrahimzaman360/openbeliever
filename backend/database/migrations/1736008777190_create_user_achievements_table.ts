import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_achievements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.integer('achievement_id').references('id').inTable('achievements').onDelete('CASCADE')
      table.timestamp('earned_at')
      table.json('achievement_data').defaultTo('{}')
      table.unique(['user_id', 'achievement_id'])

      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
