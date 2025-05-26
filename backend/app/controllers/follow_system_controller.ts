import type { HttpContext } from '@adonisjs/core/http'
import neo4jService from '#services/neo4j_service'
import cache from '@adonisjs/cache/services/main'
import NotificationService from '#services/notification_service';
import { inject } from '@adonisjs/core';
import Notification from '#models/notification';

@inject()
export default class FollowersController {
  constructor(private iNotify: NotificationService) { }

  // 🚀 Send a follow request (for private users)
  public async sendRequest({ request, response }: HttpContext) {
    const { followerId, followingId } = request.only(['followerId', 'followingId']);

    // 🛑 Prevent self-following
    if (followerId === followingId) {
      return response.badRequest({ message: "You can't follow yourself" });
    }

    // 🔍 Ensure the target user exists and check if they are private
    const userCheck = await neo4jService.query(
      `MATCH (u:User)
     WHERE u.id = toString($followingId)
     RETURN u.isPrivate AS isPrivate`,
      { followingId }
    );

    if (userCheck.length === 0) {
      return response.notFound({ message: 'User not found' });
    }

    const isPrivate = userCheck[0].isPrivate; // ✅ Ensure we correctly extract the value

    // ❌ If the user is not private, use the direct follow function instead
    if (!isPrivate) {
      return response.badRequest({ message: 'Use the regular follow endpoint instead.' });
    }

    // 🔄 Check if a follow request already exists
    const existingRequest = await neo4jService.query(
      `MATCH (a:User)-[r:REQUESTED]->(b:User)
     WHERE a.id = toString($followerId)
       AND b.id = toString($followingId)
     RETURN r`,
      { followerId, followingId }
    );

    if (existingRequest.length > 0) {
      return response.badRequest({ message: 'Follow request already exists' });
    }

    // ✅ Create the follow request relationship
    await neo4jService.query(
      `MATCH (a:User), (b:User)
     WHERE a.id = toString($followerId)
       AND b.id = toString($followingId)
     CREATE (a)-[:REQUESTED]->(b)`,
      { followerId, followingId }
    );

    // Create Notification:
    await this.iNotify.createFollowSystemNotification(followerId, followingId, 'follow_request');

    // 🗑️ Invalidate cache for both users
    await cache.delete({ key: `user:${followerId}` });
    await cache.delete({ key: `user:${followingId}` });

    return response.created({ message: 'Follow request sent' });
  }

  // Accept a follow request
  public async acceptRequest({ request, response }: HttpContext) {
    let { followerId, followingId } = request.only(["followerId", "followingId"]);

    // Check if the follow request exists
    const followRequest = await neo4jService.query(
      `MATCH (a:User {id: $followerId})-[r:REQUESTED]->(b:User {id: $followingId})
     RETURN count(r) AS count`,
      { followerId, followingId }
    );

    if (followRequest[0].count === 0) {
      return response.notFound({ message: "Follow request not found" });
    }

    // Accept request: Change `REQUESTED` relationship to `FOLLOWS` (one-way relationship)
    await neo4jService.query(
      `MATCH (a:User {id: $followerId})-[r:REQUESTED]->(b:User {id: $followingId})
     DELETE r
     MERGE (a)-[:FOLLOWS]->(b)`,
      { followerId, followingId }
    );

    // 🗑️ Invalidate cache for both users
    await cache.delete({ key: `user:${followerId}` });
    await cache.delete({ key: `user:${followingId}` });

    // delete notification
    // Find notification id by followerId, followingId & type: 'follow'
    // SenderId = followingId, ReceiverId = followerId
    const notificationId = await Notification.query()
      .where('senderId', followerId)
      .where('userId', followingId)
      .where('type', 'follow_request')
      .first();

    if (notificationId) {
      await this.iNotify.deleteNotification(notificationId.id);
    }

    // Send a notification to the follower
    await this.iNotify.createFollowSystemNotification(followingId, followerId, 'request_accepted');

    return response.ok({ message: "Follow request accepted" });
  }

  // Reject a follow request
  public async rejectRequest({ request, response }: HttpContext) {
    let { followerId, followingId } = request.only(["followerId", "followingId"]);

    if (isNaN(followerId) || isNaN(followingId)) {
      return response.badRequest({ message: "Invalid followerId or followingId" });
    }

    // Check if follow request exists
    const followRequest = await neo4jService.query(
      `MATCH (a:User {id: $followerId})-[r:REQUESTED]->(b:User {id: $followingId})
     RETURN count(r) AS count`,
      { followerId, followingId }
    );

    if (followRequest[0].count === 0) {
      return response.notFound({ message: "Follow request not found" });
    }

    // Delete follow request
    await neo4jService.query(
      `MATCH (a:User {id: $followerId})-[r:REQUESTED]->(b:User {id: $followingId})
     DELETE r`,
      { followerId, followingId }
    );

    // 🗑️ Invalidate cache for both users
    await cache.delete({ key: `user:${followerId}` });
    await cache.delete({ key: `user:${followingId}` });

    // delete notification
    // Find notification id by followerId, followingId & type: 'follow'
    const notificationId = await Notification.query()
      .where('senderId', followerId)
      .where('userId', followingId)
      .where('type', 'follow_request')
      .first();

    if (notificationId) {
      await this.iNotify.deleteNotification(notificationId.id);
    }

    return response.ok({ message: "Follow request rejected" });
  }

  // Cancel a follow request (by requester)
  public async cancelRequest({ request, response }: HttpContext) {
    const { followerId, followingId } = request.only(['followerId', 'followingId']);

    // Check if the follow request exists before deleting
    const followRequest = await neo4jService.query(
      `MATCH (a:User {id: $followerId})-[r:REQUESTED]->(b:User {id: $followingId})
     RETURN count(r) AS count`,
      { followerId, followingId }
    );

    if (followRequest[0].count === 0) {
      return response.notFound({ message: 'Follow request not found' });
    }

    // Delete the follow request
    await neo4jService.query(
      `MATCH (a:User {id: $followerId})-[r:REQUESTED]->(b:User {id: $followingId})
     DELETE r`,
      { followerId, followingId }
    );

    // 🗑️ Invalidate cache for both users
    await cache.delete({ key: `user:${followerId}` });
    await cache.delete({ key: `user:${followingId}` });

    // delete notification
    // Find notification id by followerId, followingId & type: 'follow'
    const notificationId = await Notification.query()
      .where('followerId', followerId)
      .where('followingId', followingId)
      .where('type', 'follow_request')
      .first();

    if (notificationId) {
      await this.iNotify.deleteNotification(notificationId.id);
    }

    return response.ok({ message: 'Follow request canceled' });
  }

  // Follow a user directly (for public users)
  public async follow({ request, response }: HttpContext) {
    const { followerId, followingId } = request.only(['followerId', 'followingId']);

    // 🛑 Prevent self-following
    if (followerId === followingId) {
      return response.badRequest({ message: "You can't follow yourself" });
    }

    const usersExist = await neo4jService.query(
      `MATCH (a:User), (b:User)
   WHERE a.id = $followerId
     AND b.id = $followingId
   RETURN a, b`,
      { followerId, followingId }
    );

    if (usersExist.length === 0) {
      return response.badRequest({ message: "One or both users not found" });
    }

    // ✅ Check if already following
    const existingFollow = await neo4jService.query(
      `MATCH (a:User)-[r:FOLLOWS]->(b:User)
   WHERE a.id = $followerId
     AND b.id = $followingId
   RETURN r`,
      { followerId, followingId }
    );

    if (existingFollow.length > 0) {
      return response.badRequest({ message: "Already following this user" });
    }

    // ✅ Create follow relationship (one-way only)
    await neo4jService.query(
      `MATCH (a:User), (b:User)
     WHERE a.id = $followerId
       AND b.id = $followingId
     MERGE (a)-[:FOLLOWS]->(b)`,
      { followerId, followingId }
    );

    // Create Notification:
    await this.iNotify.createFollowSystemNotification(followerId, followingId, 'follow');

    // 🗑️ Invalidate cache for both users
    await cache.delete({ key: `user:${followerId}` });
    await cache.delete({ key: `user:${followingId}` });

    return response.created({ message: 'Now following this user' });
  }

  // 🚀 Unfollow a user
  public async unfollow({ request, response }: HttpContext) {
    const { followerId, followingId } = request.only(['followerId', 'followingId']);

    // 🛑 Prevent self-unfollowing (edge case)
    if (followerId === followingId) {
      return response.badRequest({ message: "You can't unfollow yourself" });
    }

    // 🔍 Ensure both users exist
    const usersExist = await neo4jService.query(
      `MATCH (a:User), (b:User)
     WHERE a.id = $followerId
       AND b.id = $followingId
     RETURN a, b`,
      { followerId, followingId }
    );

    if (usersExist.length === 0) {
      return response.badRequest({ message: "One or both users not found" });
    }

    // 🔍 Check if the user is actually following
    const existingFollow = await neo4jService.query(
      `MATCH (a:User)-[r:FOLLOWS]->(b:User)
     WHERE a.id = $followerId
       AND b.id = $followingId
     RETURN COUNT(r) AS count`,
      { followerId, followingId }
    );

    if (existingFollow.length === 0) {
      return response.badRequest({ message: "Not following this user" });
    }

    // ❌ Remove only the outgoing FOLLOWS relationship
    await neo4jService.query(
      `MATCH (a:User)-[r:FOLLOWS]->(b:User)
     WHERE a.id = $followerId
       AND b.id = $followingId
     DELETE r`,
      { followerId, followingId }
    );

    // 🗑 Clear cache for both users
    await cache.delete({ key: `user:${followerId}` });
    await cache.delete({ key: `user:${followingId}` });

    return response.ok({ message: 'Unfollowed successfully' });
  }

  // 🚀 Remove a follower (by the current user)
  public async removeFollower({ auth, request, response }: HttpContext) {
    const { followerId } = request.only(['followerId']);
    const followingId = auth.user!.id;

    // 🛑 Prevent self-removal (edge case)
    if (followerId === followingId) {
      return response.badRequest({ message: "You can't remove yourself as a follower" });
    }

    // 🔍 Ensure both users exist
    const usersExist = await neo4jService.query(
      `MATCH (a:User), (b:User)
     WHERE a.id = $followerId
       AND b.id = $followingId
     RETURN a, b`,
      { followerId, followingId }
    );

    if (usersExist.length === 0) {
      return response.badRequest({ message: "One or both users not found" });
    }

    // 🔍 Check if the follower relationship exists
    const followRelation = await neo4jService.query(
      `MATCH (a:User)-[r:FOLLOWS]->(b:User)
     WHERE a.id = $followerId
       AND b.id = $followingId
     RETURN COUNT(r) AS count`,
      { followerId, followingId }
    );

    if (followRelation[0].count === 0) {
      return response.badRequest({ message: "User is not following you" });
    }

    // ❌ Remove the FOLLOWS relationship
    await neo4jService.query(
      `MATCH (a:User)-[r:FOLLOWS]->(b:User)
     WHERE a.id = $followerId
       AND b.id = $followingId
     DELETE r`,
      { followerId, followingId }
    );

    // 🗑️ Invalidate cache for both users
    await cache.delete({ key: `user:${followerId}` });
    await cache.delete({ key: `user:${followingId}` });

    // delete notification
    // Find notification id by followerId, followingId & type: 'follow'
    const notificationId = await Notification.query()
      .where('senderId', followerId)
      .where('userId', followingId)
      .where('type', 'follow')
      .first();

    if (notificationId) {
      await this.iNotify.deleteNotification(notificationId.id);
    }

    return response.ok({ message: 'Follower removed successfully' });
  }

}
