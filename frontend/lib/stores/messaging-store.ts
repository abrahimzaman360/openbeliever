// messaging-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SERVER_URL } from "../server";

export const useConversationStore = create<ConversationState>()(
    persist(
        (set) => ({
            conversations: [],
            activeConversationId: null,
            activeConversation: null,

            setConversations: (conversations: Conversation[]) => {
                set({ conversations });
            },

            createConversation: async (receipientId: string) => {
                try {
                    const res = await fetch(`${SERVER_URL}/api/chat-engine/conversations/create`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        cache: "no-store",
                        body: JSON.stringify({ receipientId }),
                    });

                    if (!res.ok) throw new Error(`Failed to create conversation: ${res.statusText}`);
                    const data = await res.json();

                    const newConversation: Conversation = {
                        id: data.id,
                        receiptId: receipientId,
                        messages: [],
                        type: data.type || "private",
                        lastMessage: "",
                        lastMessageTime: new Date().toISOString(),
                        lastMessageAttachment: null,
                        unread: 0,
                        archived: false,
                        blocked: false,
                    };

                    set((state) => ({
                        conversations: [...state.conversations, newConversation],
                        activeConversationId: data.id,
                        activeConversation: newConversation,
                    }));

                    return { success: true, conversationId: data.id };
                } catch (error) {
                    console.error("Error creating conversation:", error);
                    return { success: false, error };
                }
            },

            addMessage: (conversationId: string, message: Message) => {
                set((state) => {
                    const updatedConversations = state.conversations.map((conv) => {
                        if (conv.id === conversationId) {
                            const messages = [...(conv.messages || [])];
                            const existingIndex = messages.findIndex((m) => m.id === message.id);
                            if (existingIndex === -1) {
                                messages.push(message);
                            }
                            return {
                                ...conv,
                                messages,
                                lastMessage: message.content || "attachment",
                                lastMessageTime: message.createdAt,
                                unread: state.activeConversationId === conversationId ? conv.unread : (conv.unread || 0) + 1,
                                lastMessageAttachment: message.attachments?.[0] || null,
                            };
                        }
                        return conv;
                    });

                    const updatedActiveConversation =
                        state.activeConversation?.id === conversationId
                            ? {
                                ...state.activeConversation,
                                messages: (() => {
                                    const messages = [...(state.activeConversation.messages || [])];
                                    const existingIndex = messages.findIndex((m) => m.id === message.id);
                                    if (existingIndex === -1) {
                                        messages.push(message);
                                    }
                                    return messages;
                                })(),
                                lastMessage: message.content || "attachment",
                                lastMessageTime: message.createdAt,
                                lastMessageAttachment: message.attachments?.[0] || null,
                            }
                            : state.activeConversation;

                    return {
                        conversations: updatedConversations,
                        activeConversation: updatedActiveConversation,
                    };
                });
            },

            setActiveConversation: (id: string | null) => {
                set((state) => ({
                    activeConversationId: id,
                    activeConversation: id ? state.conversations.find((conv) => conv.id === id) || null : null,
                }));
            },

            updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => {
                set((state) => {
                    const updatedConversations = state.conversations.map((conv) => {
                        if (conv.id !== conversationId) return conv;
                        const updatedMessages = conv.messages.map((msg) =>
                            msg.id === messageId ? { ...msg, ...updates } : msg
                        );
                        return {
                            ...conv,
                            messages: updatedMessages,
                            lastMessage: updates.content || conv.lastMessage,
                            lastMessageTime: updates.createdAt || conv.lastMessageTime,
                            lastMessageAttachment: updates.attachments?.[0] || conv.lastMessageAttachment,
                        };
                    });
                    const updatedActiveConversation =
                        state.activeConversation?.id === conversationId
                            ? {
                                ...state.activeConversation,
                                messages: updatedConversations.find((c) => c.id === conversationId)!.messages,
                                lastMessage: updates.content || state.activeConversation.lastMessage,
                                lastMessageTime: updates.createdAt || state.activeConversation.lastMessageTime,
                                lastMessageAttachment: updates.attachments?.[0] || state.activeConversation.lastMessageAttachment,
                            }
                            : state.activeConversation;
                    return { conversations: updatedConversations, activeConversation: updatedActiveConversation };
                });
            },

            clearConversation: (conversationId: string) => {
                set((state) => ({
                    conversations: state.conversations.map((conv) =>
                        conv.id === conversationId ? { ...conv, messages: [] } : conv
                    ),
                    activeConversation:
                        state.activeConversation?.id === conversationId
                            ? { ...state.activeConversation, messages: [] }
                            : state.activeConversation,
                }));
            },

            deleteConversation: async (conversationId: string) => {
                try {
                    const res = await fetch(`${SERVER_URL}/api/chat-engine/conversations/${conversationId}`, {
                        method: "DELETE",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                    });

                    if (!res.ok) throw new Error("Failed to delete conversation");

                    set((state) => ({
                        conversations: state.conversations.filter((conv) => conv.id !== conversationId),
                        activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId,
                        activeConversation: state.activeConversation?.id === conversationId ? null : state.activeConversation,
                    }));
                } catch (error) {
                    console.error("Error deleting conversation:", error);
                }
            },

            deleteConversations: (ids: string[]) => {
                set((state) => ({
                    conversations: state.conversations.filter((conv) => !ids.includes(conv.id)),
                    activeConversationId: ids.includes(state.activeConversationId || "") ? null : state.activeConversationId,
                    activeConversation: ids.includes(state.activeConversation?.id || "") ? null : state.activeConversation,
                }));
            },

            markAsRead: (ids: string[]) => {
                set((state) => ({
                    conversations: state.conversations.map((conv) =>
                        ids.includes(conv.id) ? { ...conv, unread: 0 } : conv
                    ),
                    activeConversation:
                        state.activeConversation && ids.includes(state.activeConversation.id)
                            ? { ...state.activeConversation, unread: 0 }
                            : state.activeConversation,
                }));
            },

            syncConversations: async () => {
                try {
                    const res = await fetch(`${SERVER_URL}/api/chat-engine/conversations`, {
                        credentials: "include",
                    });
                    if (!res.ok) throw new Error("Failed to sync conversations");
                    const data = await res.json();

                    const syncedConversations: Conversation[] = data.conversations.map((conv: any) => ({
                        id: conv.id,
                        receiptId: conv.receipientId || conv.receiptId,
                        messages: conv.messages || [],
                        type: conv.type || "private",
                        lastMessage: conv.lastMessage || "",
                        lastMessageTime: conv.lastMessageTime || new Date().toISOString(),
                        lastMessageAttachment: conv.lastMessageAttachment || null,
                        unread: conv.unread || 0,
                        archived: conv.archived || false,
                        blocked: conv.blocked || false,
                        totalMessages: conv.totalMessages || 0,
                    }));

                    set({ conversations: syncedConversations });
                } catch (error) {
                    console.error("Error syncing conversations:", error);
                }
            },
            fetchMoreMessages: async (conversationId: string, page: number, limit: number = 50) => {
                try {
                    const url = `${SERVER_URL}/api/chat-engine/conversations/${conversationId}/messages?page=${page}&limit=${limit}`;
                    const res = await fetch(url, { credentials: "include", cache: "reload" });

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(`Failed to fetch messages: ${res.status} - ${res.statusText} - ${JSON.stringify(errorData)}`);
                    }

                    const data = await res.json();
                    const newMessages: Message[] = (data.messages || []).map((msg: any) => ({
                        id: msg.id,
                        content: msg.content,
                        senderMetadata: {
                            id: msg.senderId,
                            name: msg.senderName || "Unknown",
                            avatar: msg.senderAvatar || "",
                        },
                        createdAt: msg.createdAt,
                        status: msg.status || "delivered",
                        messageType: msg.messageType || "text",
                        attachments: msg.attachments || [],
                    }));

                    set((state) => {
                        const updatedConversations = state.conversations.map((conv) => {
                            if (conv.id === conversationId) {
                                const existingMessages = conv.messages || [];
                                const mergedMessages = [...newMessages, ...existingMessages]
                                    .filter((msg, index, self) => self.findIndex((m) => m.id === msg.id) === index)
                                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                                return { ...conv, messages: mergedMessages };
                            }
                            return conv;
                        });

                        const updatedActiveConversation =
                            state.activeConversation?.id === conversationId
                                ? { ...state.activeConversation, messages: updatedConversations.find((c) => c.id === conversationId)!.messages }
                                : state.activeConversation;

                        return {
                            conversations: updatedConversations,
                            activeConversation: updatedActiveConversation,
                        };
                    });

                    return { success: true, hasMore: data.hasMore || false };
                } catch (error) {
                    console.error(`Error fetching messages for conversation ${conversationId}, page ${page}:`, error);
                    return { success: false, hasMore: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
        }),
        {
            name: "openconversations",
        }
    )
);

export const useTypingStore = create<TypingStore>((set) => ({
    typingUsers: {},
    setTypingUsers: (conversationId: string, users: string[]) =>
        set((state) => ({
            typingUsers: { ...state.typingUsers, [conversationId]: users },
        })),
}));