import { showMyProfile } from '#abilities/profile-abilities'
import PostFavorite from '#models/post_favorite'
import User from '#models/user'
import env from '#start/env'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import cache from '@adonisjs/cache/services/main'
import neo4jService from '#services/neo4j_service'

export default class AccountsController {
  async me({ auth, response, request, bouncer }: HttpContext) {
    const currentUser = await auth.use('web').authenticate()

    const data = await cache.getOrSet({
      key: `user:${currentUser.id!}`,
      factory: async () => {
        try {
          if (await bouncer.allows(showMyProfile, currentUser)) {
            const page = request.input('page', 1);
            const limit = request.input('limit', 10);

            // Load posts with pagination
            const posts = await currentUser
              .related('posts')
              .query()
              .preload('likes', (query) => query.preload('user'))
              .preload('favorites', (query) => query.preload('user'))
              .orderBy('created_at', 'desc')
              .paginate(page, limit);

            const favorites = await PostFavorite.query()
              .where('user_id', currentUser.id)
              .preload('post', (query) => {
                query.preload('likes')
                query.preload('favorites')
              })
              .orderBy('created_at', 'desc')
              .exec()

            const followersQuery = `
            MATCH (user:User {id: toString($userId)})<-[:FOLLOWS]-(follower:User)
            RETURN follower.id AS id, follower.username AS username, follower.avatar AS avatar, follower.name AS name, follower.isPrivate AS isPrivate
            `;
            const rawFollowers = await neo4jService.query(followersQuery, { userId: currentUser.id });

            // Convert `id` field to a JavaScript number
            const followers = rawFollowers.map(record => ({
              id: record.id,
              username: record.username,
              avatar: record.avatar,
              name: record.name,
              isPrivate: record.isPrivate
            }));

            // Fetch followings
            const followingsQuery = `
            MATCH (user:User {id: toString($userId)})-[:FOLLOWS]->(following:User)
            RETURN following.id AS id, following.username AS username, following.avatar AS avatar, following.name AS name, following.isPrivate AS isPrivate
            `;
            const rawFollowings = await neo4jService.query(followingsQuery, { userId: currentUser.id });

            const followings = rawFollowings.map(record => ({
              id: record.id,
              username: record.username,
              avatar: record.avatar,
              name: record.name,
              isPrivate: record.isPrivate
            }));

            // Fetch follow requests
            const requestsQuery = `
            MATCH (requester:User)-[:REQUESTED]->(user:User {id: toString($userId)})
            RETURN requester.id AS id, requester.username AS username, requester.avatar AS avatar, requester.name AS name, requester.isPrivate AS isPrivate
            `;
            const rawRequests = await neo4jService.query(requestsQuery, { userId: currentUser.id });

            const requests = rawRequests.map(record => ({
              id: record.id,
              username: record.username,
              avatar: record.avatar,
              name: record.name,
              isPrivate: record.isPrivate
            }));

            const userInfo = {
              id: currentUser.id,
              name: currentUser.name,
              username: currentUser.username,
              email: currentUser.email,
              bio: currentUser.bio,
              link: currentUser.link,
              private: currentUser.isPrivate,
              avatar: currentUser.avatar,
              coverImage: currentUser.coverImage,
              emailVerified: currentUser.isEmailVerified,
              posts: {
                total: posts.total, // Get the count of posts
                list: posts.total > 0 ? posts : [], // List of posts
              },
              followers: {
                total: followers.length, // Get the count of followers
                list: followers.length > 0 ? followers : [], // List of followers
              },
              followings: {
                total: followings.length, // Get the count of followees
                list: followings.length > 0 ? followings : [], // List of followees
              },
              requests: {
                total: requests.length, // Get the count of requests
                list: requests.length > 0 ? requests : [], // List of requests
              },
              favorites: {
                total: favorites.length,
                list: favorites.length > 0 ? favorites.map((fav) => fav.post) : [],
              },
            }

            return userInfo; // Return userInfo instead of response
          }

          // Return an error object or message
          return { error: 'BANPAN 1.0 -> You are not allowed to view this profile!' };
        } catch (error) {
          // Log the error and return a defined value
          console.error('Error in cache factory function:', error);
          return { error: 'An error occurred while retrieving the profile.' };
        }
      }, ttl: '1m',
    });

    // Use the 'in' operator to check for the 'error' property
    if ('error' in data) {
      return response.forbidden(data);
    }

    return response.status(200).json(data);
  }

  async update_account(ctx: HttpContext) {
    // update user
    const currentUser = await ctx.auth.use('web').authenticate()
    const data = ctx.request.body()

    // validate the data:
    // check username availability
    if (data.username && data.username !== currentUser.username) {
      const user = await User.findBy('username', data.username)
      if (user) {
        return ctx.response.notFound({ message: 'Username is already taken!' })
      }
    }

    // update user data
    currentUser.name = data.name || null
    currentUser.username = data.username
    currentUser.bio = data.bio || null
    currentUser.link = data.link || null
    currentUser.isPrivate = data.private || false
    await currentUser.save()

    // Update Graph DB
    await neo4jService.query(
      `MERGE (u:User {id: toString($id)})
       SET u.name = $name,
       u.username = $username,
       u.email = $email,
       u.isPrivate = $isPrivate,
       u.avatar = $avatar`,
      {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        isPrivate: currentUser.isPrivate ? 1 : 0,
        avatar: currentUser.avatar
      }
    );

    // update cache
    await cache.delete({ key: `user:${currentUser.id}` })

    return ctx.response.ok({ message: 'Account updated!' })
  }

  // check username availability
  async username_availability({ request, response }: HttpContext) {
    const { username } = request.body()
    const user = await User.findBy('username', username)

    return response.json({
      available: !user,
      message: user ? 'Username is taken' : 'Username is available',
    })
  }

  // update avatar
  async upload_avatar(ctx: HttpContext) {
    const currentUser = await ctx.auth.use('web').authenticate()
    const avatar = ctx.request.file('avatar', {
      size: '5mb',
    })

    // check if avatar is valid
    if (!avatar) {
      return ctx.response.badRequest({ message: 'Avatar is required' })
    }

    // check if avatar already exists
    if (currentUser.avatar) {
      try {
        await drive.use(env.get('DRIVE_DISK')).delete(currentUser.avatar)
      } catch (error) {
        console.log(error)
      }
    }

    // Generate clean filename and path
    const filename = `${cuid()}.${avatar.extname}`
    const key = `avatars/${filename}` // Remove leading slash
    const url = await drive.use(env.get('DRIVE_DISK')).getUrl(key)
    await avatar.moveToDisk(key, env.get('DRIVE_DISK'))
    currentUser.avatar = url
    await currentUser.save()

    // Update GraphDB
    // remove from Graph DB as well:
    await neo4jService.query(
      `MERGE (u:User {id: toString($id)})
       SET u.name = $name,
       u.username = $username,
       u.email = $email,
       u.isPrivate = $isPrivate,
       u.avatar = $avatar`,
      {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        isPrivate: currentUser.isPrivate ? 1 : 0,
        avatar: currentUser.avatar
      }
    );


    // delete cache
    await cache.delete({ key: `user:${currentUser.id}` })

    // return response
    return ctx.response.ok({ message: 'Upload successfully' })
  }

  // remove avatar
  async remove_avatar(ctx: HttpContext) {
    const currentUser = await ctx.auth.use('web').authenticate()

    // check if user has avatar
    if (!currentUser.avatar) {
      return ctx.response.notFound({ message: 'Avatar not found!' })
    }

    // delete avatar
    try {
      await drive.use(env.get('DRIVE_DISK')).delete(currentUser.avatar)
    } catch (error) {
      console.log(error)
    }

    // update user
    currentUser.avatar = null
    await currentUser.save()

    // remove from Graph DB as well:
    await neo4jService.query(
      `MERGE (u:User {id: toString($id)})
       SET u.name = $name,
       u.username = $username,
       u.email = $email,
       u.isPrivate = $isPrivate,
       u.avatar = $avatar`,
      {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        isPrivate: currentUser.isPrivate ? 1 : 0,
        avatar: currentUser.avatar
      }
    );

    // delete cache
    await cache.delete({ key: `user:${currentUser.id}` })

    return ctx.response.ok({ message: 'Avatar removed!' })
  }

  // update cover image
  async upload_cover(ctx: HttpContext) {
    const currentUser = await ctx.auth.use('web').authenticate()
    const cover = ctx.request.file('cover', {
      size: '8mb',
    })

    // check if cover is valid
    if (!cover) {
      return ctx.response.badRequest({ message: 'Cover Image is required' })
    }

    // check if cover already exists
    if (currentUser.coverImage) {
      try {
        await drive.use(env.get('DRIVE_DISK')).delete(currentUser.coverImage)
      } catch (error) {
        console.log(error)
        return ctx.response.badRequest({ message: 'Failed to delete cover' })
      }
    }

    // Generate clean filename and path
    const filename = `${cuid()}.${cover.extname}`
    const key = `covers/${filename}` // Remove leading slash
    const url = await drive.use(env.get('DRIVE_DISK')).getUrl(key)
    await cover.moveToDisk(key, env.get('DRIVE_DISK'))
    currentUser.coverImage = url
    await currentUser.save()

    // delete cache
    await cache.delete({ key: `user:${currentUser.id}` })

    // return response
    return ctx.response.ok({ message: 'Upload successfully' })
  }

  // Warning: This is a very dangerous endpoint, use with caution!
  async delete_account({ auth, response }: HttpContext) {
    const currentUser = await auth.use('web').authenticate();

    if (!currentUser) {
      return response.unauthorized({ message: 'Unauthorized!' })
    }

    try {
      // delete GraphDB relationships:
      // 🗑️ Remove all relationships (bidirectional)
      await neo4jService.query(
        `MATCH (u:User {id: ($userId})-[r]-() DELETE r`,
        { userId: currentUser.id }
      );

      // ❌ Delete the user node
      await neo4jService.query(
        `MATCH (u:User {id: toString($userId}) DELETE u`,
        { userId: currentUser.id }
      );

      // delete user
      await currentUser.delete()

      // delete cache
      await cache.delete({ key: `user:${currentUser.id}` })

      return response.ok({ message: 'Account deleted!' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'Something went wrong!' })
    }
  }
}
