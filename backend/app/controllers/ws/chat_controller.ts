import type { WebSocketContext, WebSocket } from "adonisjs-websocket";
import redis from '@adonisjs/redis/services/main';
import { WebSocketMessageService } from "#services/websocket_service";
import { cuid } from "@adonisjs/core/helpers";
import Message from "#models/chat-system/message";
import Conversation from "#models/chat-system/conversation";
import User from "#models/user";
import neo4jService from "#services/neo4j_service";
import Media from "#models/chat-system/media";
import { inject } from "@adonisjs/core";

@inject()
export default class ChatController {
  private readonly ONLINE_TTL = 1800; // 30 minutes

  constructor(private websocket_service: WebSocketMessageService) { }

  public async handle({ ws, auth, params }: WebSocketContext) {
    console.log("⚡ WebSocket connection initiated", params);
    const userId = params?.userId;

    try {
      const currentUser = await auth.authenticate();
      if (!currentUser || currentUser.id !== userId) {
        throw new Error("User not authenticated or ID mismatch");
      }

      await this.setUserOnline(currentUser.id);
      this.websocket_service.registerClient(currentUser.id, ws);
      console.log(`⚡ User ${currentUser.id} connected. Active subscriptions:`);

      ws.on("message", async (rawData: any) => {
        console.log(`📩 Received message from ${currentUser.id}:`, rawData);
        await this.processMessage(rawData, ws, currentUser);
      });

      const intervalId = setInterval(async () => {
        const updatedOnlineUsers = await this.sendOnlineConnections(ws, currentUser.id);
        if (ws.readyState === ws.OPEN && updatedOnlineUsers) {
          ws.send(
            JSON.stringify({ type: "online_connections", data: updatedOnlineUsers })
          );
        }
      }, 10000);

      ws.on("close", async () => {
        clearInterval(intervalId);
        await this.setUserOffline(currentUser.id);
        await this.websocket_service.unregisterClient(currentUser.id);
        await this.cleanupInvalidKeys();
        console.log(`⚡ User ${currentUser.id} disconnected. Remaining subscriptions:`);
      });

      ws.on("error", (error) => {
        console.error(`❌ WebSocket error for user ${currentUser.id}:`, error);
      });
    } catch (error) {
      console.error(`❌ Error in WebSocket handle for user ${userId}:`, error);
      this.sendError(ws, "Connection error", error.message);
      if (ws.readyState === ws.OPEN) {
        ws.close(1008, "Authentication failed");
      }
    }
  }

  private async processMessage(rawData: any, ws: WebSocket, currentUser: User) {
    try {
      const payload = this.parseRawData(rawData);
      if (!payload.type) {
        this.sendError(ws, "Invalid message", "Payload is missing type");
        return;
      }

      payload.data ||= {};

      switch (payload.type) {
        case "chat_message":
          if (!payload.data?.conversationId) {
            this.sendError(ws, "Invalid message", "Payload is missing conversationId");
            return;
          }
          console.log(`📨 Processing chat_message for ${currentUser.id}:`, payload);
          await this.handleChatMessage(payload.data, currentUser, ws);
          break;
        case "online_connections":
          await this.sendOnlineConnections(ws, currentUser.id);
          break;
        case "join_conversation":
          await this.handleJoinConversation(payload, currentUser.id, ws);
          break;
        case "leave_conversation":
          await this.handleLeaveConversation(payload, currentUser.id, ws);
          break;
        case "typing":
        case "stop_typing":
          await this.handleTyping(payload, currentUser.id);
          break;
        case "identify":
          ws.send(
            JSON.stringify({ type: "connection_established", userId: currentUser.id })
          );
          break;
        default:
          this.sendError(
            ws,
            "Unknown message type",
            `Type '${payload.type}' is not supported`
          );
      }
    } catch (error) {
      console.error(`❌ Failed to process message for ${currentUser.id}:`, error);
      this.sendError(ws, "Failed to process message", error.message);
    }
  }

  private async handleChatMessage(messageData: any, currentUser: User, socket: WebSocket) {
    const conversationId = messageData.conversationId;
    let conversation = await Conversation.query()
      .where("id", conversationId)
      .preload("members")
      .first();

    let isNewConversation = false;
    if (!conversation) {
      const receiptId = messageData.receiptId;
      if (!receiptId && messageData.type !== "group") {
        this.sendError(
          socket,
          "Invalid message",
          "Missing receiptId for new private chat"
        );
        return;
      }
      conversation = await Conversation.create({
        id: conversationId || cuid(),
        creatorId: currentUser.id,
        receipientId: receiptId,
        type: messageData.type === "group" ? "group" : "private",
      });
      isNewConversation = true;
    }

    const isGroupChat = conversation.type === "group";
    const messageId = messageData.id || cuid();

    const messagePayload = {
      id: messageId,
      conversationId: conversation.id,
      content: messageData.content,
      senderMetadata: {
        id: currentUser.id,
        name: currentUser.name || "Unknown",
        avatar: currentUser.avatar || "",
      },
      messageType: messageData.messageType || "text",
      status: "sent" as const,
      createdAt: null as string | null,
      attachments: [] as any[],
    };

    if (isGroupChat) {
      await this.handleGroupChat(conversation, messagePayload, messageData, currentUser, socket);
    } else {
      await this.handlePrivateChat(conversation, messagePayload, messageData, currentUser, socket);
    }

    if (isNewConversation) {
      const newConversationPayload = {
        type: "new_conversation",
        conversationId: conversation.id,
        data: messagePayload,
      };
      const redisConn = redis.connection("subscription");
      if (conversation.type === "group") {
        await redisConn.publish(
          `conversation:${conversation.id}:messages`,
          JSON.stringify(newConversationPayload)
        );
      } else {
        const recipientId = conversation.receipientId!;
        await Promise.all([
          redisConn.publish(
            `user:${recipientId}:messages`,
            JSON.stringify(newConversationPayload)
          ),
          redisConn.publish(
            `user:${currentUser.id}:messages`,
            JSON.stringify(newConversationPayload)
          ),
        ]);
      }
    }
  }

  private async handleGroupChat(
    conversation: Conversation,
    messagePayload: any,
    messageData: any,
    currentUser: User,
    socket: WebSocket
  ) {
    const message = await Message.create({
      id: messagePayload.id,
      conversationId: messagePayload.conversationId,
      senderId: currentUser.id,
      content: messagePayload.content,
      messageType: messagePayload.messageType,
      status: messagePayload.status,
    });

    messagePayload.createdAt = message.createdAt.toISO();
    socket.send(JSON.stringify({ type: "message_sent", data: messagePayload }));

    const savedAttachments = await this.saveAttachments(message.id, messageData.attachments);
    messagePayload.attachments = savedAttachments.map((att) => ({
      ...att,
      url: `${process.env.SERVER_URL || "http://localhost:3333"}${att.url}`,
    }));

    const redisPayload = JSON.stringify({
      type: "new_message",
      conversationId: conversation.id,
      data: messagePayload,
    });

    await redis.connection("subscription").publish(
      `conversation:${conversation.id}:messages`,
      redisPayload
    );
    console.log(`📤 Published to conversation:${conversation.id}:messages`, redisPayload);
  }

  private async handlePrivateChat(
    conversation: Conversation,
    messagePayload: any,
    messageData: any,
    currentUser: User,
    socket: WebSocket
  ) {
    const message = await Message.create({
      conversationId: messagePayload.conversationId,
      senderId: currentUser.id,
      content: messagePayload.content,
      messageType: messagePayload.messageType,
      status: messagePayload.status,
    });

    messagePayload.createdAt = message.createdAt.toISO();
    socket.send(JSON.stringify({ type: "message_sent", data: messagePayload }));

    const savedAttachments = await this.saveAttachments(message.id, messageData.attachments);
    messagePayload.attachments = savedAttachments;


    console.log("messagePayload", messagePayload);

    const recipientId =
      conversation.creatorId === currentUser.id
        ? conversation.receipientId!
        : conversation.creatorId;
    if (recipientId && recipientId !== currentUser.id) {
      const redisPayload = JSON.stringify({
        type: "new_message",
        conversationId: conversation.id,
        data: messagePayload,
      });
      await redis.connection("subscription").publish(
        `user:${recipientId}:messages`,
        redisPayload
      );
      console.log(`📤 Published to user:${recipientId}:messages`, redisPayload);
    }
  }

  private async saveAttachments(messageId: string, attachments: any[] = []) {
    const savedAttachments = [];
    for (const attachment of attachments) {
      const media = await Media.create({
        id: cuid(),
        messageId,
        fileUrl: attachment.url,
        fileType: attachment.type,
        fileSize: attachment.size || 0,
        duration: attachment.duration || 0,
        thumbnailUrl: attachment.thumbnailUrl || null,
      });
      savedAttachments.push({
        id: media.id,
        url: media.fileUrl,
        type: media.fileType,
        size: media.fileSize,
        duration: media.duration,
        thumbnailUrl: media.thumbnailUrl,
      });
    }
    return savedAttachments;
  }

  private async handleTyping(payload: any, currentUserId: string) {
    const conversationId = payload.data?.conversationId;
    if (!conversationId) {
      console.error(`❌ No conversationId provided for ${payload.type} event by ${currentUserId}`);
      return;
    }

    const typingPayload = {
      type: payload.type,
      data: { conversationId, userId: currentUserId },
    };

    console.log(`📝 Typing event payload from ${currentUserId}:`, typingPayload);

    const conversation = await Conversation.findOrFail(conversationId);
    const redisConn = redis.connection("subscription");

    if (conversation.type === "group") {
      await redisConn.publish(
        `conversation:${conversationId}:typings`,
        JSON.stringify(typingPayload)
      );
      console.log(`📤 Published to conversation:${conversationId}:typings`);
    } else {
      const recipientId =
        conversation.creatorId === currentUserId
          ? conversation.receipientId!
          : conversation.creatorId;
      if (recipientId && recipientId !== currentUserId) {
        await redisConn.publish(
          `user:${recipientId}:typings`,
          JSON.stringify(typingPayload)
        );
        console.log(`📤 Published to user:${recipientId}:typings`);
      }
    }
  }

  private async sendOnlineConnections(ws: WebSocket, userId: string) {
    try {
      if (!this.isValidUserId(userId) || ws.readyState !== ws.OPEN) return undefined;

      const connectionsQuery = `
        MATCH (user:User {id: toString($userId)})-[:FOLLOWS]-(connection:User)
        RETURN DISTINCT connection.id AS id
      `;
      const rawConnections = await neo4jService.query(connectionsQuery, { userId });
      const connectionIds = rawConnections.map((record) => record.id);

      const onlineConnections = [];
      for (const id of connectionIds) {
        if (id === userId) continue;
        if (await this.isUserOnline(id)) onlineConnections.push(id);
      }

      return { onlineConnections, totalConnections: connectionIds.length };
    } catch (error) {
      console.error(`❌ Failed to fetch online connections for ${userId}:`, error);
      this.sendError(ws, "Failed to get online connections", error.message);
      return undefined;
    }
  }

  private parseRawData(rawData: any): any {
    try {
      if (typeof rawData === "string") return JSON.parse(rawData);
      if (rawData instanceof Buffer) return JSON.parse(rawData.toString());
      if (typeof rawData === "object" && rawData !== null) return rawData;
      throw new Error(`Unsupported message format: ${typeof rawData}`);
    } catch (error) {
      console.error("❌ Failed to parse raw data:", error);
      return {};
    }
  }

  private sendError(ws: WebSocket, message: string, details: string, extra?: any) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "error", message, details, ...extra }));
    }
  }

  private async handleJoinConversation(payload: any, currentUserId: string, ws: WebSocket) {
    const { conversationId, userId } = payload.data;

    if (!conversationId || !userId) {
      this.sendError(ws, "Invalid message", "Missing conversationId or userId");
      return;
    }

    if (userId !== currentUserId) {
      this.sendError(ws, "Unauthorized", "User ID does not match authenticated user");
      return;
    }

    try {
      const conversation = await Conversation.query()
        .where("id", conversationId)
        .preload("members")
        .firstOrFail();

      const isGroupChat = conversation.type === "group";
      const isMember = isGroupChat
        ? conversation.members.some((m) => m.id === currentUserId)
        : [conversation.creatorId, conversation.receipientId].includes(currentUserId);

      if (!isMember) {
        this.sendError(ws, "Forbidden", "You are not a member of this conversation");
        return;
      }

      await this.websocket_service.subscribeToConversation(currentUserId, conversationId);
      ws.send(JSON.stringify({
        type: "conversation_joined",
        conversationId,
        userId: currentUserId,
      }));
      console.log(`✅ User ${currentUserId} joined conversation ${conversationId}`);
    } catch (error) {
      console.error(`❌ Failed to join conversation ${conversationId} for ${currentUserId}:`, error);
      this.sendError(ws, "Failed to join conversation", error.message);
    }
  }

  private async handleLeaveConversation(payload: any, currentUserId: string, ws: WebSocket) {
    const { previousConversationId } = payload.data;

    if (!previousConversationId) {
      this.sendError(ws, "Invalid message", "Missing conversationId");
      return;
    }

    try {
      await this.websocket_service.unsubscribeFromConversation(currentUserId, previousConversationId);
      ws.send(JSON.stringify({
        type: "leave_conversation",
        conversationId: previousConversationId,
        userId: currentUserId,
      }));
      console.log(`📴 User ${currentUserId} left conversation ${previousConversationId}`);
    } catch (error) {
      console.error(`❌ Failed to leave conversation ${previousConversationId} for ${currentUserId}:`, error);
      this.sendError(ws, "Failed to leave conversation", error.message);
    }
  }

  private async setUserOnline(userId: string): Promise<void> {
    if (!this.isValidUserId(userId)) return;
    try {
      await redis.connection('subscription').set(`user:${userId}:online`, "true", "EX", this.ONLINE_TTL);
    } catch (error) {
      console.error(`❌ Failed to set user ${userId} online:`, error);
    }
  }

  private async setUserOffline(userId: string): Promise<void> {
    if (!this.isValidUserId(userId)) return;
    try {
      await redis.connection('subscription').del(`user:${userId}:online`);
    } catch (error) {
      console.error(`❌ Failed to set user ${userId} offline:`, error);
    }
  }

  private async isUserOnline(userId: string): Promise<boolean> {
    if (!this.isValidUserId(userId)) return false;
    try {
      return (await redis.connection('subscription').exists(`user:${userId}:online`)) === 1;
    } catch (error) {
      console.error(`❌ Failed to check online status for ${userId}:`, error);
      return false;
    }
  }

  private async cleanupInvalidKeys(): Promise<void> {
    try {
      const invalidKeys = await redis.connection('subscription').keys("user:undefined:*");
      if (invalidKeys.length > 0) {
        await redis.connection('subscription').del(...invalidKeys);
        console.log(`🧹 Deleted ${invalidKeys.length} invalid keys`);
      }
    } catch (error) {
      console.error("❌ Error cleaning up invalid keys:", error);
    }
  }

  private isValidUserId(userId: string): boolean {
    return !!userId && userId.trim() !== "undefined" && userId.trim() !== "";
  }
}
