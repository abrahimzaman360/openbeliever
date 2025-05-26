import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { faker } from '@faker-js/faker'
import neo4jService from '#services/neo4j_service'

export default class extends BaseSeeder {


  async run() {
    await neo4jService.wipeNeo4jDatabase();

    for (let i = 0; i < 10; i++) {
      const eachUser = await User.create({
        name: faker.person.fullName(),
        username: faker.internet.username().toLowerCase(), // Random username
        email: faker.internet.email().toLowerCase(), // Random email
        password: 'mrtux360', // Default password for all users
        isEmailVerified: faker.datatype.boolean(), // Random email verification status
        avatar: null, // Random avatar
        bio: faker.lorem.sentence(), // Random bio
        link: faker.internet.url(), // Random URL
        isPrivate: faker.datatype.boolean(), // Random private status
        isAdmin: false, // Not an admin
      })



      // Store User in Graph Database (Neo4j):
      await neo4jService.query(
        `
      MERGE (u:User {id: $id})
      SET u.name = $name,
          u.username = $username,
          u.email = $email,
          u.isPrivate = $isPrivate,
          u.avatar = CASE WHEN $avatar IS NOT NULL THEN $avatar ELSE u.avatar END
      RETURN u
      `,
        {
          id: eachUser.id,
          name: eachUser.name,
          username: eachUser.username,
          email: eachUser.email,
          isPrivate: eachUser.isPrivate ? 1 : 0,
          avatar: eachUser.avatar || null
        }
      );
    }
  }
}
