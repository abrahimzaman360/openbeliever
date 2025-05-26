// app/controllers/conversations_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Conversation from '#models/chat-system/conversation'
import Message from '#models/chat-system/message'
import NotificationService from '#services/notification_service'
import Media from '#models/chat-system/media'
import { inject } from '@adonisjs/core'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import env from '#start/env'

@inject()
export default class ConversationsController {
  constructor(private notificationService: NotificationService) { }
  public async storeP2P({ auth, request, response }: HttpContext) {
    const currentUser = await auth.authenticate()
    const { receipientId } = request.only(['receipientId'])

    if (!receipientId || typeof receipientId !== 'string') {
      return response.badRequest({ message: 'Recipient ID is required' })
    }

    const recipient = await User.find(receipientId)
    if (!recipient) {
      return response.notFound({ message: 'Recipient does not exist' })
    }

    if (currentUser.id === receipientId) {
      return response.badRequest({ message: 'Cannot create a conversation with yourself' })
    }

    const existingConversation = await Conversation.query()
      .where('type', 'private')
      .whereHas('members', (builder) => {
        builder.where('user_id', currentUser.id).where('is_deleted', false)
      })
      .whereHas('members', (builder) => {
        builder.where('user_id', receipientId).where('is_deleted', false)
      })
      .first()

    let conversation = existingConversation
    if (!conversation) {
      conversation = await Conversation.create({
        type: 'private',
        creatorId: currentUser.id,
        receipientId,
      })
      const memberIds = [currentUser.id, receipientId]
      await conversation.related('members').attach(
        memberIds.reduce((acc, id) => ({ ...acc, [id]: { is_deleted: false } }), {})
      )
    }

    return response.created({ id: conversation.id })
  }

  public async sendMessage({ auth, request, response }: HttpContext) {
    const currentUser = await auth.authenticate()
    const { conversationId, content, messageType = 'text', attachments } = request.only([
      'conversationId',
      'content',
      'messageType',
      'attachments',
    ])

    if (!conversationId || !content) {
      return response.badRequest({ message: 'Conversation ID and content are required' })
    }

    const conversation = await Conversation.query()
      .where('id', conversationId)
      .whereHas('members', (builder) => {
        builder.where('user_id', currentUser.id).where('is_deleted', false)
      })
      .firstOrFail()

    const message = await Message.create({
      conversationId,
      senderId: currentUser.id,
      content,
      messageType,
      status: 'sent',
      isEdited: false,
      isPinned: false,
      isDeleted: false,
    })

    if (attachments && attachments.length > 0) {
      const mediaRecords = attachments.map((attachment: any) => ({
        messageId: message.id,
        fileUrl: attachment.url,
        fileType: attachment.type,
        fileSize: attachment.size || 0,
        duration: attachment.duration || null,
        thumbnailUrl: attachment.thumbnailUrl || null,
      }))
      await Media.createMany(mediaRecords)
      await message.load('media')
    }

    const members = await conversation.related('members').query()
    const recipientIds = members.filter((m) => m.id !== currentUser.id).map((m) => m.id)

    // Send notifications to recipients
    await this.notificationService.createMultipleMessageNotification(
      currentUser.id,
      recipientIds,
      'message',
      {
        messageId: message.id,
        conversationId,
      }
    )

    return response.created({ message: message.serialize() })
  }

  public async syncConversations({ auth, response }: HttpContext) {
    const currentUser = await auth.authenticate();

    const conversations = await Conversation.query()
      .where((query) => {
        query
          .where('creator_id', currentUser.id)
          .orWhereHas('members', (builder) => {
            builder.where('user_id', currentUser.id).where('is_deleted', false);
          });
      })
      .preload('members')
      .preload('messages', (query) => {
        query.orderBy('created_at', 'desc').limit(1); // Only load the last message for metadata
      })
      .exec();

    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const receiptId =
          conv.type === 'private'
            ? conv.creatorId === currentUser.id
              ? conv.members.find((m) => m.id !== currentUser.id)?.id || conv.receipientId || ''
              : conv.creatorId
            : null;

        const lastMessage = conv.messages[0] || null;
        const totalMessages = await Message.query()
          .where('conversation_id', conv.id)
          .count('* as total')
          .first()
          .then((result) => Number(result?.$extras.total) || 0);

        return {
          id: conv.id,
          receiptId,
          type: conv.type,
          lastMessage: lastMessage ? lastMessage.content : '',
          lastMessageTime: lastMessage
            ? lastMessage.createdAt.toISO()
            : conv.createdAt.toISO() || '',
          lastMessageAttachment: lastMessage,
          unread: await Message.query()
            .where('conversation_id', conv.id)
            .where('sender_id', '!=', currentUser.id)
            .whereNull('read_at')
            .count('* as unread')
            .first()
            .then((result) => Number(result?.$extras.unread) || 0),
          archived: conv.isArchived || false,
          blocked: false, // Add logic if you implement blocking
          totalMessages, // Total message count for pagination reference
        };
      })
    );

    return response.ok({ conversations: formattedConversations });
  }

  public async fetchMessages({ auth, params, request, response }: HttpContext) {
    const currentUser = await auth.authenticate();
    const conversationId = params.conversationId; // Change from params.id to params.conversationId
    const { page = 1, limit = 50 } = request.qs();


    if (!conversationId) {
      return response.badRequest({ message: 'Conversation ID is required' });
    }

    const conversation = await Conversation.query()
      .where('id', conversationId)
      .whereHas('members', (builder) => {
        builder.where('user_id', currentUser.id).where('is_deleted', false);
      })
      .preload('messages', (query) => {
        query
          .orderBy('created_at', 'asc')
          .preload('media')
          .limit(limit)
          .offset((page - 1) * limit);
      })
      .firstOrFail();

    const messages = conversation.messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      createdAt: msg.createdAt.toISO(),
      status: msg.status,
      messageType: msg.messageType || 'text',
      attachments: msg.media.map((media) => ({
        id: media.id,
        url: media.fileUrl,
        type: media.fileType,
        size: media.fileSize,
        duration: media.duration || 0,
        thumbnailUrl: media.thumbnailUrl || null,
      })),
    }));

    const totalMessages = await Message.query()
      .where('conversation_id', conversationId)
      .count('* as total')
      .first()
      .then((result) => Number(result?.$extras.total) || 0);

    return response.ok({
      messages,
      totalMessages,
      page,
      limit,
      hasMore: page * limit < totalMessages,
    });
  }

  public async uploadAttachment({ auth, request, response }: HttpContext) {
    const currentUser = await auth.authenticate()

    if (!request.files('attachment')) {
      return response.badRequest({ message: 'No file uploaded' })
    }

    if (!currentUser) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    // Handle file upload
    const files = request.files('attachment', {
      size: '10mb', // Max file size
      extnames: ['jpg', 'png', 'mp3', 'mp4', 'pdf'], // Allowed file types
    })

    if (!files || files.length === 0) {
      return response.badRequest({ message: 'No file uploaded' })
    }

    const savedFiles = []
    for (const file of files) {
      const fileName = `${cuid()}.${file.extname}`
      const key = `/messages/${fileName}` // Remove leading slash
      const url = await drive.use(env.get('DRIVE_DISK')).getUrl(key)
      await file.moveToDisk(key, env.get('DRIVE_DISK'))

      // Determine file type
      let fileType: 'image' | 'audio' | 'video' | 'file'
      switch (file.extname?.toLowerCase()) {
        case 'jpg':
        case 'png':
          fileType = 'image'
          break
        case 'mp3':
          fileType = 'audio'
          break
        case 'mp4':
          fileType = 'video'
          break
        default:
          fileType = 'file'
      }

      savedFiles.push({
        id: cuid(),
        url: url,
        type: fileType,
        size: file.size,
        duration: fileType === 'audio' || fileType === 'video' ? 0 : null, // Add logic to calculate duration if needed
        thumbnailUrl: fileType === 'image' ? `/messages/thumbs/${fileName}` : null, // Add thumbnail generation if needed
      })
    }

    return response.ok({ attachments: savedFiles })
  }

  // GROUP Chats
  public async storeGroup({ auth, request, response }: HttpContext) {
    const currentUser = await auth.authenticate()
    const { userIds } = request.only(['userIds'])

    // Validate userIds
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return response.badRequest({ message: 'At least one member ID is required for group conversation' })
    }

    // Ensure uniqueness and include current user
    const uniqueUserIds = [...new Set([currentUser.id, ...userIds])]
    if (uniqueUserIds.length < 3) {
      return response.badRequest({ message: 'Group conversations require at least two other members' })
    }

    // Check if all users exist
    const users = await User.query().whereIn('id', uniqueUserIds)
    if (users.length !== uniqueUserIds.length) {
      return response.notFound({ message: 'One or more users do not exist' })
    }

    // Create the group conversation
    const conversation = await Conversation.create({
      type: 'group',
      creatorId: currentUser.id,
      receipientId: null, // Explicitly NULL for groups
    })

    // Attach all members
    await conversation.related('members').attach(
      uniqueUserIds.reduce((acc, id) => ({ ...acc, [id]: { is_deleted: false } }), {})
    )

    return response.created({ conversation })
  }

  // Add a member to an existing group conversation
  public async addMember({ auth, request, params, response }: HttpContext) {
    const currentUser = await auth.authenticate()
    const conversationId = params.id
    const { userId } = request.only(['userId'])

    const conversation = await Conversation.query()
      .where('id', conversationId)
      .where('type', 'group')
      .whereHas('members', (builder) => {
        builder.where('user_id', currentUser.id).where('is_deleted', false)
      })
      .firstOrFail()

    const user = await User.findOrFail(userId)

    // Check if user is already a member
    const isMember = await conversation.related('members').query().where('user_id', user.id).first()
    if (isMember) {
      return response.badRequest({ message: 'User is already a member' })
    }

    await conversation.related('members').attach({
      [user.id]: { is_deleted: false },
    })

    return response.ok({ message: 'Member added to group' })
  }

  // Delete (hide) conversation for the current user
  public async delete({ auth, params, response }: HttpContext) {
    const currentUser = await auth.authenticate()
    const conversationId = params.id

    const conversation = await Conversation.query()
      .where('id', conversationId)
      .whereHas('members', (builder) => {
        builder.where('user_id', currentUser.id)
      })
      .firstOrFail()

    await conversation.related('members').pivotQuery()
      .where('user_id', currentUser.id)
      .update({ is_deleted: true })

    return response.ok({ message: 'Conversation removed from your list' })
  }
}
