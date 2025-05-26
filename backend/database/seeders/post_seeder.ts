import Post from '#models/post'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { faker } from '@faker-js/faker'

export default class extends BaseSeeder {
  async run() {
    const users = await User.all() // Fetch all users
    const userIds = users.map((user) => user.id) // Get the list of IDs

    for (let i = 0; i < 50; i++) {
      await Post.create({
        userId: faker.helpers.arrayElement(userIds), // Assuming 10 users exist
        content: faker.lorem.paragraph({
          min: 1,
          max: 10,
        }), // Random content
        attachments: {
          gifs: [],
          images: [],
          videos: [],
        },
        topic: faker.lorem.word(), // Random topic
        privacy: faker.helpers.arrayElement(['private', 'public', 'followers']), // Random privacy
      })
    }
  }
}
