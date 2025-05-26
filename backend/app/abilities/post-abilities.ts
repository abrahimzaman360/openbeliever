import { Bouncer } from '@adonisjs/bouncer'
import User from '#models/user'
import Post from '#models/post'
import neo4jService from '#services/neo4j_service'

export const viewPost = Bouncer.ability(async (user: User, post: Post) => {
  const isCollaborator = await post
    .related('collaborators')
    .query()
    .where('user_id', user.id)
    .first()

  const isFollowing = await neo4jService.query(
    `MATCH (follower:User {id: $followerId})-[:FOLLOWS {status: 'accepted'}]->(following:User {id: $followingId})
   RETURN follower LIMIT 1`,
    { followerId: user.id, followingId: post.userId }
  );

  if (
    post.privacy === 'public' ||
    post.userId === user.id ||
    !!isCollaborator ||
    isFollowing.length > 0 // If a relationship exists in Neo4j
  ) {
    return true;
  }
  return false
})

export const updatePost = Bouncer.ability(async (user: User, post: Post) => {
  const isCollaborator = await post
    .related('collaborators')
    .query()
    .where('user_id', user.id)
    .where('can_edit', true)
    .first()

  return post.userId === user.id || !!isCollaborator
})

export const deletePost = Bouncer.ability(async (user: User, post: Post) => {
  const isCollaborator = await post
    .related('collaborators')
    .query()
    .where('user_id', user.id)
    .where('role', 'author')
    .first()

  return post.userId === user.id || !!isCollaborator
})
