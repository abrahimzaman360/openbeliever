import Notification from '#models/notification'
import User from '#models/user'

export default class NotificationService {
  private async createNotification(to: string, sender: string, type: string, data: any = {}) {
    await Notification.create({
      userId: to,
      senderId: sender,
      type: type,
      data: data,
      isRead: false
    })
  }

  async createMessageNotification(senderId: string, recipientId: string, type: string, data: any = {}) {
    return this.createNotification(
      recipientId,
      senderId,
      type,
      data
    )
  }

  async createMultipleMessageNotification(senderId: string, recipientIds: string[], type: string, data: any = {}) {
    for (const recipientId of recipientIds) {
      await this.createMessageNotification(senderId, recipientId, type, data)
    }
  }

  async createFollowSystemNotification(followerId: string, followingId: string, type: string) {
    const followerUser = await User.findOrFail(followerId)

    if (followerUser.id) {
      return this.createNotification(
        followingId,        // The recipient user (following user)
        followerId,         // The sender user (follower user)
        type,
        {
          read_at: null,    // Add read_at here as needed
        }
      )
    }
  }


  async getUnreadNotifications(userId: number) {
    return await Notification.query()
      .where('userId', userId)
      .where('isRead', false)
      .orderBy('createdAt', 'desc')
  }

  async markAsRead(notificationId: number) {
    const notification = await Notification.findOrFail(notificationId)
    notification.isRead = true
    await notification.save()
    return notification
  }

  async markAllAsRead(userId: number) {
    await Notification.query()
      .where('userId', userId)
      .where('isRead', false)
      .update({ isRead: true })
  }

  async deleteNotification(notificationId: number) {
    const notification = await Notification.findOrFail(notificationId)
    await notification.delete()
    return notification
  }
}
