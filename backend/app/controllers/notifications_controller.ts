import Notification from '#models/notification'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async index({ auth, request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const authenticatedUser = await auth.authenticate()

    // Fetch notifications and preload the sender's data (user info)
    const notifications = await Notification.query()
      .where('user_id', authenticatedUser.id)
      .preload('sender', (query) => {
        query.select(['id', 'name', 'username', 'avatar']) // Preload sender info
      })
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    // Format the notifications
    const formattedNotifications = notifications.toJSON().data.map((notification) => {
      const sender = notification.$preloaded?.sender || null // Access preloaded sender, null if absent
      console.log(notification)
      return {
        id: notification.$original.id, // number, matches frontend
        type: notification.$original.type, // string, matches frontend
        data: {
          message: notification.$original.data?.message || null, // string | null, matches frontend
          user: sender
            ? {
              id: sender.id, // Keep as number (assuming users table uses numeric IDs; adjust if UUID)
              name: sender.name, // string
              username: sender.username, // string
              avatar: sender.avatar || null, // string | null
            }
            : {
              id: 0, // Default system user ID (adjust as needed)
              name: 'System',
              username: 'system',
              avatar: null,
            }, // Provide default user if sender is null
          read_at: notification.data?.read_at || null, // string | null, matches frontend
        },
        is_read: notification.isRead, // boolean, matches frontend
        createdAt: notification.createdAt?.toISO() || null, // string (ISO), matches frontend
      }
    })

    // Return formatted notifications
    return response.json({
      data: formattedNotifications,
      meta: {
        current_page: notifications.currentPage,
        last_page: notifications.lastPage,
        per_page: notifications.perPage,
        total: notifications.total,
      },
    })
  }
}
