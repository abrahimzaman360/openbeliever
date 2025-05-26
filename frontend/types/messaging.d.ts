type MessageStatus = "sent" | "delivered" | "read" | "failed" | "pending";

type MessageAttachment = {
  id?: string;
  type: "image" | "audio" | "video" | "file";
  url: string;
  name?: string;
  size?: number;
  isLocalPreview?: boolean;
};

interface SenderMetadata {
  id: string;
  name: string;
  avatar: string;
}

type Message = {
  id: string;
  content: string;
  senderMetadata: SenderMetadata;
  createdAt: string;
  readAt?: string;
  updatedAt?: string;
  status: MessageStatus;
  messageType: string; // Explicitly defined
  attachments?: MessageAttachment[];
};

type Conversation = {
  id: string;
  receiptId: string;
  type: "group" | "private";
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  lastMessageAttachment?: MessageAttachment | null;
  unread: number;
  archived?: boolean;
  blocked?: boolean;
};

interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  setConversations: (conversations: Conversation[]) => void;
  createConversation: (receipientId: string) => Promise<{ success: boolean; conversationId?: string; error?: any }>;
  addMessage: (conversationId: string, message: Message) => void;
  setActiveConversation: (id: string | null) => void;
  clearConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  deleteConversations: (ids: string[]) => void;
  markAsRead: (ids: string[]) => void;
  syncConversations: () => Promise<void>;
  fetchMoreMessages: (
    conversationId: string,
    page: number,
    limit?: number
  ) => Promise<{ success: boolean; hasMore: boolean; error?: any }>;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
}


interface TypingStore {
  typingUsers: { [conversationId: string]: string[] };
  setTypingUsers: (conversationId: string, users: string[]) => void;
}