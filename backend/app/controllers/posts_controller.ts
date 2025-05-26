import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { createPostValidator } from '#validators/post'
import env from '#start/env'
import { cuid } from '@adonisjs/core/helpers'
import { inject } from '@adonisjs/core'
import drive from '@adonisjs/drive/services/main'
import MultiImageVariantsService from '#services/multi_image_variants'
import neo4jService from '#services/neo4j_service'

@inject()
export default class PostsController {
  constructor(private compressor: MultiImageVariantsService) { }

  async feed({ auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const rankBy = request.input('rankBy', 'recent')

    // 🟢 Fetch followed authors from Neo4j
    const followedAuthors = await neo4jService.query(
      `MATCH (:User {id: toString($userId)})-[:FOLLOWS]->(following:User)
   RETURN following.id AS followingId`,
      { userId: auth.user!.id }
    );

    // 🟢 Extract only integer IDs (convert from Neo4j BigInt objects)
    const followedAuthorIds = followedAuthors.map((f) => (typeof f.followingId === 'object' ? f.followingId.low : f.followingId));

    // 🟢 Build SQL query for fetching posts
    const query = Post.query()
      .where((builder) => {
        if (followedAuthorIds.length > 0) {
          builder.whereIn('user_id', followedAuthorIds);
        }
        builder.orWhere('privacy', 'public');
      })
      .whereNot('privacy', 'private')
      .preload('author')
      .preload('saves')
      .preload('engagements');

    // 🟢 Apply ranking if needed
    switch (rankBy) {
      case 'readTime':
        query.orderBy('estimated_read_time', 'desc');
        break;
      case 'saves':
        query.withCount('saves').orderBy('saves_count', 'desc');
        break;
      default:
        query.orderBy('created_at', 'desc');
    }

    // 🟢 Paginate results
    const posts = await query.paginate(page, limit);

    console.log('BANPAN 1.0 -> Posts:', posts.serialize())

    return posts
  }

  async store({ request, auth, response }: HttpContext) {
    const author = auth.user!
    console.log('BANPAN 1.0 -> Author:', request.body())
    const payload = await request.validateUsing(createPostValidator)

    try {
      const newPost = await Post.create({
        content: payload.content,
        userId: author.id,
        privacy: payload.privacy,
        topic: payload.topic,
        tags: JSON.parse(payload.tags || '[]'), // Parse the JSON string to array
      })

      // Handle file uploads
      const gifs = payload.gifs && payload.gifs?.length > 0 ? payload.gifs : []
      const images = payload.images && payload.images?.length > 0 ? payload.images : []
      const videos = payload.videos && payload.videos?.length > 0 ? payload.videos : []

      // Upload files and get their URLs
      const uploadedGifs = await Promise.all(
        gifs.map(async (file: any) => {
          const fileClientName = file.clientName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
          const fileName = `/posts/${newPost.id}/gifs/${cuid()}-${fileClientName}`
          await file.moveToDisk(fileName)
          return fileName
        })
      )

      const uploadedImages = await Promise.all(
        images.map(async (file: any) => {
          // Instead of just compressing to one file, generate multiple variants
          const variantPaths = await this.compressor.generate(file, newPost.id)

          // Return an array of uploaded variant paths; store them if you want or pick your logic
          return variantPaths
        })
      )

      const uploadedVideos = await Promise.all(
        videos.map(async (file: any) => {
          const fileClientName = file.clientName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
          const fileName = `/posts/${newPost.id}/videos/${cuid()}-${fileClientName}`
          await file.moveToDisk(fileName)
          return fileName
        })
      )

      const gifsUrls = await Promise.all(
        uploadedGifs.map(async (path) => await drive.use(env.get('DRIVE_DISK')).getUrl(path))
      )
      // Flatten all arrays of variant paths
      const flattenImagePaths = uploadedImages.flat()
      const videosUrls = await Promise.all(
        uploadedVideos.map(async (path) => await drive.use(env.get('DRIVE_DISK')).getUrl(path))
      )

      newPost.merge({
        attachments: {
          gifs: gifsUrls,
          images: flattenImagePaths,
          videos: videosUrls,
        },
      })

      await newPost.save()

      return response.created({ message: 'Post created successfully' })
    } catch (error) {
      console.error('BANPAN 1.0 -> Failed to create post', error)
      return response.badRequest({ message: 'BANPAN 1.0 -> Failed to create post' })
    }
  }

  async show({ params, bouncer, response }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    if (await bouncer.denies('viewPost', post)) {
      return response.forbidden('BANPAN 1.0 -> You cannot view the post!')
    }

    await post.load('author')
    await post.load('topics')
    await post.load('taggedUsers')

    return post
  }

  async update({ params, request, response, bouncer }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    if (await bouncer.denies('updatePost', post)) {
      return response.forbidden('BANPAN 1.0 -> You cannot edit the post!')
    }
    const data = request.only(['title', 'content', 'media', 'hashtags', 'privacy'])

    await post.merge(data).save()
    return post
  }

  async destroy({ params, bouncer, response }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    if (await bouncer.denies('deletePost', post)) {
      return response.forbidden('BANPAN 1.0 -> You cannot delete the post!')
    }

    await post.delete()
    return { message: 'Post deleted successfully' }
  }
}
