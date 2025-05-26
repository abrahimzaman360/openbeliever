import Post from '#models/post'
import PostFavourite from '#models/post_favorite'
import PostLike from '#models/post_like'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostInteractionController {
  async PostHeart(ctx: HttpContext) {
    const postId = ctx.params.id
    const currentUser = ctx.auth.user!

    const post = await Post.findBy('id', postId)
    if (!post) {
      return ctx.response.notFound({ message: 'Post not found' })
    }

    const existingLike = await PostLike.query()
      .where('post_id', postId)
      .where('user_id', currentUser.id)
      .first()

    if (existingLike) {
      await existingLike.delete()
      return ctx.response.ok({
        message: 'Post unliked successfully',
        action: 'removed',
      })
    }

    await PostLike.create({
      postId,
      userId: currentUser.id,
    })

    return ctx.response.created({
      message: 'Post liked successfully',
      action: 'added',
    })
  }

  async PostFavorite(ctx: HttpContext) {
    const postId = ctx.params.id
    const currentUser = ctx.auth.user!

    const post = await Post.findBy('id', postId)
    if (!post) {
      return ctx.response.notFound({ message: 'Post not found' })
    }

    const existingFavorite = await PostFavourite.query()
      .where('post_id', postId)
      .where('user_id', currentUser.id)
      .first()

    if (existingFavorite) {
      await existingFavorite.delete()
      return ctx.response.ok({
        message: 'Post removed from favorites',
        action: 'removed',
      })
    }

    await PostFavourite.create({
      postId,
      userId: currentUser.id,
    })

    return ctx.response.created({
      message: 'Post added to favorites successfully',
      action: 'added',
    })
  }
}
