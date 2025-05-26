import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'diaries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.timestamp('date').notNullable().defaultTo(this.now());
      table.boolean('is_pinned').defaultTo(false);
      table.timestamps(true);
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
