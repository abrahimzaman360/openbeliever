import redis from '@adonisjs/redis/services/main';
import type { WebSocket } from "adonisjs-websocket";

export class WebSocketMessageService {
  private clients: Map<string, WebSocket> = new Map();
  private subscribedChannels: Map<string, Set<string>> = new Map(); // userId -> Set<channel>
  private channelToUsers: Map<string, Set<string>> = new Map(); // channel -> Set<userId>
  private subscription = redis.connection('subscription');

  constructor() {
    this.subscription.on('error', (error) => {
      console.error('❌ Redis subscription error:', error);
    });
  }

  public registerClient(userId: string, ws: WebSocket): void {
    this.clients.set(userId, ws);
    this.setupSubscriptions(userId);

    ws.on("close", () => {
      this.unregisterClient(userId);
    });
  }

  public async unregisterClient(userId: string): Promise<void> {
    this.clients.delete(userId);
    const channels = this.subscribedChannels.get(userId);

    if (channels) {
      for (const channel of channels) {
        try {
          const isPattern = channel.includes('*');
          if (isPattern) {
            await this.subscription.punsubscribe(channel);
          } else {
            await this.subscription.unsubscribe(channel);
          }
          const users = this.channelToUsers.get(channel);
          if (users) {
            users.delete(userId);
            if (users.size === 0) {
              this.channelToUsers.delete(channel);
            }
          }
          console.log(`📴 Unsubscribed user ${userId} from ${channel}`);
        } catch (error) {
          console.error(`❌ Failed to unsubscribe user ${userId} from ${channel}:`, error);
        }
      }
      this.subscribedChannels.delete(userId);
    }
    console.log(`⚡ User ${userId} fully unregistered from all channels`);
  }

  private async setupSubscriptions(userId: string): Promise<void> {
    const messagesChannel = `user:${userId}:messages`;
    const typingsChannel = `user:${userId}:typings`;

    if (!this.subscribedChannels.has(userId)) {
      this.subscribedChannels.set(userId, new Set());
    }
    const userChannels = this.subscribedChannels.get(userId)!;

    // Subscribe to messages channel
    if (!userChannels.has(messagesChannel)) {
      try {
        const channels = await this.subscription.pubsub('CHANNELS', messagesChannel);
        if (!channels.includes(messagesChannel)) {
          await this.subscription.subscribe(messagesChannel, (message) => {
            console.log(`📥 Received message on ${messagesChannel}:`, message);
            this.sendToClient(userId, message);
          });
          console.log(`📥 Subscribed user ${userId} to ${messagesChannel}`);
        } else {
          console.log(`📥 Channel ${messagesChannel} already subscribed, reusing for user ${userId}`);
        }
        userChannels.add(messagesChannel);
        if (!this.channelToUsers.has(messagesChannel)) {
          this.channelToUsers.set(messagesChannel, new Set());
        }
        this.channelToUsers.get(messagesChannel)!.add(userId);
      } catch (error) {
        console.error(`❌ Failed to subscribe user ${userId} to ${messagesChannel}:`, error);
      }
    }

    // Subscribe to typings channel
    if (!userChannels.has(typingsChannel)) {
      try {
        const channels = await this.subscription.pubsub('CHANNELS', typingsChannel);
        if (!channels.includes(typingsChannel)) {
          await this.subscription.subscribe(typingsChannel, (message) => {
            console.log(`📥 Received message on ${typingsChannel}:`, message);
            this.sendToClient(userId, message);
          });
          console.log(`📥 Subscribed user ${userId} to ${typingsChannel}`);
        } else {
          console.log(`📥 Channel ${typingsChannel} already subscribed, reusing for user ${userId}`);
        }
        userChannels.add(typingsChannel);
        if (!this.channelToUsers.has(typingsChannel)) {
          this.channelToUsers.set(typingsChannel, new Set());
        }
        this.channelToUsers.get(typingsChannel)!.add(userId);
      } catch (error) {
        console.error(`❌ Failed to subscribe user ${userId} to ${typingsChannel}:`, error);
      }
    }
  }

  public async subscribeToConversation(userId: string, conversationId: string): Promise<void> {
    const messagesChannel = `conversation:${conversationId}:messages`;
    const typingsChannel = `conversation:${conversationId}:typings`;

    if (!this.subscribedChannels.has(userId)) {
      this.subscribedChannels.set(userId, new Set());
    }
    const userChannels = this.subscribedChannels.get(userId)!;

    // Subscribe to conversation messages
    if (!this.channelToUsers.has(messagesChannel)) {
      this.channelToUsers.set(messagesChannel, new Set());
    }
    const messagesUsers = this.channelToUsers.get(messagesChannel)!;

    if (!messagesUsers.has(userId)) {
      messagesUsers.add(userId);
      userChannels.add(messagesChannel);

      if (messagesUsers.size === 1) {
        try {
          await this.subscription.subscribe(messagesChannel, (message) => {
            console.log(`📥 Received message in ${messagesChannel}:`, message);
            for (const uid of messagesUsers) {
              this.sendToClient(uid, message);
            }
          });
          console.log(`📥 Subscribed to ${messagesChannel} for first user ${userId}`);
        } catch (error) {
          console.error(`❌ Failed to subscribe to ${messagesChannel}:`, error);
          messagesUsers.delete(userId);
          userChannels.delete(messagesChannel);
          return;
        }
      } else {
        console.log(`📥 Added user ${userId} to ${messagesChannel}, already subscribed`);
      }
    }

    // Subscribe to conversation typings
    if (!this.channelToUsers.has(typingsChannel)) {
      this.channelToUsers.set(typingsChannel, new Set());
    }

    const typingsUsers = this.channelToUsers.get(typingsChannel)!;

    if (!typingsUsers.has(userId)) {
      typingsUsers.add(userId);
      userChannels.add(typingsChannel);

      if (typingsUsers.size === 1) {
        try {
          await this.subscription.subscribe(typingsChannel, (message) => {
            console.log(`📥 Received message in ${typingsChannel}:`, message);
            for (const uid of typingsUsers) {
              this.sendToClient(uid, message);
            }
          });
          console.log(`📥 Subscribed to ${typingsChannel} for first user ${userId}`);
        } catch (error) {
          console.error(`❌ Failed to subscribe to ${typingsChannel}:`, error);
          typingsUsers.delete(userId);
          userChannels.delete(typingsChannel);
          return;
        }
      } else {
        console.log(`📥 Added user ${userId} to ${typingsChannel}, already subscribed`);
      }
    }
  }

  public async unsubscribeFromConversation(userId: string, conversationId: string): Promise<void> {
    const messagesChannel = `conversation:${conversationId}:messages`;
    const typingsChannel = `conversation:${conversationId}:typings`;

    const userChannels = this.subscribedChannels.get(userId);
    if (!userChannels) return;

    // Unsubscribe from messages channel
    if (this.channelToUsers.has(messagesChannel)) {
      const users = this.channelToUsers.get(messagesChannel)!;
      if (users.has(userId)) {
        users.delete(userId);
        userChannels.delete(messagesChannel);

        if (users.size === 0) {
          try {
            await this.subscription.unsubscribe(messagesChannel);
            console.log(`📴 Unsubscribed from ${messagesChannel}, no more users`);
            this.channelToUsers.delete(messagesChannel);
          } catch (error) {
            console.error(`❌ Failed to unsubscribe from ${messagesChannel}:`, error);
          }
        } else {
          console.log(`📴 Removed user ${userId} from ${messagesChannel}, still subscribed by others`);
        }
      }
    }

    // Unsubscribe from typings channel
    if (this.channelToUsers.has(typingsChannel)) {
      const users = this.channelToUsers.get(typingsChannel)!;
      if (users.has(userId)) {
        users.delete(userId);
        userChannels.delete(typingsChannel);

        if (users.size === 0) {
          try {
            await this.subscription.unsubscribe(typingsChannel);
            console.log(`📴 Unsubscribed from ${typingsChannel}, no more users`);
            this.channelToUsers.delete(typingsChannel);
          } catch (error) {
            console.error(`❌ Failed to unsubscribe from ${typingsChannel}:`, error);
          }
        } else {
          console.log(`📴 Removed user ${userId} from ${typingsChannel}, still subscribed by others`);
        }
      }
    }
  }

  private sendToClient(userId: string, message: string): void {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === ws.OPEN) {
      try {
        const parsedMessage = JSON.parse(message); // Ensure message is valid JSON
        ws.send(JSON.stringify(parsedMessage)); // Send structured message
        console.log(`📨 Sent message to user ${userId} via WebSocket:`, parsedMessage);
      } catch (error) {
        console.error(`❌ Failed to parse or send message to user ${userId}:`, error, message);
      }
    } else {
      console.log(`📨 No open WebSocket for user ${userId}`);
    }
  }

  public getSubscribedChannels(userId: string): string[] {
    return Array.from(this.subscribedChannels.get(userId) || []);
  }
}

export default new WebSocketMessageService();
