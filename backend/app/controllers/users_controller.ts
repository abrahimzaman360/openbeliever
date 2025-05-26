import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import neo4jService from '#services/neo4j_service';


export default class UsersController {
  async show(ctx: HttpContext) {
    const username = ctx.params.username;
    const currentUser = ctx.auth.user!;

    // Get user from database
    const requestedUser = await User.findBy('username', username);
    if (!requestedUser) {
      return ctx.response.notFound({ message: 'User not found' });
    }

    // Get posts from database
    const posts = await requestedUser.related('posts').query().paginate(1, 10);

    // Get followers from Neo4j
    const followers = await neo4jService.query(
      `MATCH (u:User {id: toString($userId)})<-[:FOLLOWS]-(follower:User) RETURN follower`,
      { userId: requestedUser.id }
    );

    // Get followings from Neo4j
    const followings = await neo4jService.query(
      `MATCH (u:User {id: toString($userId)})-[:FOLLOWS]->(following:User) RETURN following`,
      { userId: requestedUser.id }
    );

    // Convert Neo4j results to user objects
    const followersList = followers.map(f => f.follower.properties);
    const followingsList = followings.map(f => f.following.properties);

    // Return user data (if account is public)
    if (!requestedUser.isPrivate) {
      return ctx.response.ok({
        id: requestedUser.id,
        username: requestedUser.username,
        avatar: requestedUser.avatar,
        name: requestedUser.name,
        coverImage: requestedUser.coverImage,
        bio: requestedUser.bio,
        link: requestedUser.link,
        private: requestedUser.isPrivate,
        posts: {
          total: posts.total,
          list: posts.total > 0 ? posts : [],
        },
        followers: {
          total: followersList.length,
          list: followersList,
        },
        followings: {
          total: followingsList.length,
          list: followingsList,
        },
      });
    }


    // 🛑 Check follow request status
    const requestStatusQuery = await neo4jService.query(
      `MATCH (following:User)
      WHERE following.id = toString($requestedUserId)
      OPTIONAL MATCH (follower:User)
      WHERE follower.id = toString($currentUserId)
      OPTIONAL MATCH (follower)-[f:FOLLOWS]->(following)
      OPTIONAL MATCH (follower)-[r:REQUESTED]->(following)
      RETURN
        CASE
          WHEN f IS NOT NULL THEN 'accepted'
          WHEN r IS NOT NULL THEN 'requested'
          ELSE NULL
        END AS requestStatus`,
      { currentUserId: currentUser.id, requestedUserId: requestedUser.id }
    );


    console.log('Request Status Query:', requestStatusQuery);

    // Get the request status
    const requestStatus = requestStatusQuery.length > 0 ? requestStatusQuery[0].requestStatus : null;

    console.log('Request Status:', requestStatus);

    // 🔒 Handle private account responses
    return ctx.response.ok({
      id: requestedUser.id,
      username: requestedUser.username,
      avatar: requestedUser.avatar || null,
      name: requestedUser.name,
      coverImage: requestedUser.coverImage,
      bio: requestedUser.bio,
      link: requestedUser.link,
      private: requestedUser.isPrivate,
      requestStatus: requestStatus,
      posts: requestStatus === 'accepted' ? {
        total: posts.total,
        list: posts.total > 0 ? posts : [],
      } : undefined,
      followers: requestStatus === 'accepted' ? {
        total: followersList.length,
        list: followersList,
      } : undefined,
      followings: requestStatus === 'accepted' ? {
        total: followingsList.length,
        list: followingsList,
      } : undefined,
    });
  }
}
