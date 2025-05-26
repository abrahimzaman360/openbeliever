import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery).unique()
      table.string('name').notNullable()
      table.string('username').unique().notNullable()
      table.string('email').unique().notNullable()
      table.string('password').notNullable()
      table.text('bio')
      table.string('link')
      table.string('gender')
      table.timestamp('date_of_birth')
      table.string('country')
      table.boolean('is_private').defaultTo(false)
      table.boolean('is_admin').defaultTo(false)
      table.float('productivity_score').defaultTo(0)
      table.float('learning_score').defaultTo(0)
      table.float('impact_score').defaultTo(0)
      table.boolean('is_email_verified').defaultTo(false)
      table.boolean('is_blue_verified').defaultTo(false)
      table.json('preferences').defaultTo('{}')
      table.json('social_links').defaultTo('{}')
      table.string('avatar').defaultTo(null)
      table.string('cover_image')
      table.timestamp('last_active').notNullable().defaultTo(this.now())

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
