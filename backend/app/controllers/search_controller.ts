import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SearchController {
  async searchUsers(ctx: HttpContext) {
    const { query } = ctx.request.qs()
    const minQueryLength = 2

    if (!query || String(query).length < minQueryLength) {
      return
    }

    const sanitizedQuery = String(query).replace(/[^a-zA-Z0-9 ]/g, '')

    try {
      const users = await User.query()
        .where((builder) => {
          builder
            .whereILike('name', `%${sanitizedQuery}%`)
            .orWhereILike('username', `%${sanitizedQuery}%`)
        })
        .select(['id', 'name', 'username', 'avatar', 'isPrivate'])
        .orderBy('name', 'asc')
        .limit(10)

      const usersList = users.map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        private: user.isPrivate,
      }))

      return ctx.response.ok({
        users: usersList,
      })
    } catch (error) {
      console.error(error)
      return ctx.response.internalServerError({
        message: 'Failed to perform user search',
        error: error.message,
      })
    }
  }
}
