"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import ConversationList from "./messages-conversations";
import MessageView from "./messages-view";
import { XIcon } from "lucide-react";
import { useAuth } from "@/lib/providers/auth-provider";
import {
  useConversationStore,
  useTypingStore,
} from "@/lib/stores/messaging-store";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import CreateConversation from "./create-conversation";
import Link from "next/link";
import { useWebSocket } from "@/lib/providers/websocket-provider";

export default function MessageInbox() {
  const { user } = useAuth();
  const {
    conversations,
    setConversations,
    addMessage,
    setActiveConversation,
    activeConversationId,
    updateMessage,
    syncConversations,
  } = useConversationStore();
  const { setTypingUsers, typingUsers } = useTypingStore();
  const { isConnected, send, onMessage, connectionError } = useWebSocket();

  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    []
  );
  const [previousConversationId, setPreviousConversationId] = useState<
    string | null
  >(null);

  const uniqueUsers = useMemo(() => {
    const allUsers = [
      ...(user?.followers?.list || []),
      ...(user?.followings?.list || []),
    ];
    return Array.from(new Map(allUsers.map((u) => [u.id, u])).values());
  }, [user]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [activeConversationId, conversations]
  );

  const activeUser = useMemo(
    () =>
      uniqueUsers.find((u) => u.id === activeConversation?.receiptId) || null,
    [activeConversation, uniqueUsers]
  );

  useEffect(() => {
    if (user?.id && isConnected) syncConversations();
  }, [user?.id, isConnected, syncConversations]);

  const handleChatMessage = useCallback(
    (message: any) => {
      if (
        message.type === "new_message" ||
        message.type === "chat_message" ||
        message.type === "new_conversation"
      ) {
        const { conversationId, data: msgData } = message;
        const normalizedMessage = {
          ...msgData,
          senderMetadata: {
            id: msgData.senderId || msgData.senderMetadata?.id,
            name:
              msgData.senderName || msgData.senderMetadata?.name || "Unknown",
            avatar:
              msgData.senderAvatar || msgData.senderMetadata?.avatar || "",
          },
        };
        addMessage(conversationId, normalizedMessage);

        const existingConversation = conversations.find(
          (c) => c.id === conversationId
        );
        if (!existingConversation) {
          const receiptId =
            normalizedMessage.senderMetadata.id === user!.id
              ? activeConversation?.receiptId
              : normalizedMessage.senderMetadata.id;
          const newConversation: Conversation = {
            id: conversationId,
            receiptId,
            messages:
              activeConversationId === conversationId
                ? [normalizedMessage]
                : [],
            type: msgData.type || "private",
            lastMessage: msgData.content || "attachment",
            lastMessageTime: msgData.createdAt,
            lastMessageAttachment: msgData.attachments?.[0] || null,
            unread: activeConversationId === conversationId ? 0 : 1,
            archived: false,
            blocked: false,
          };
          setConversations([...conversations, newConversation]);
        }

        if (!activeConversationId) setActiveConversation(conversationId);
      }
    },
    [
      user,
      conversations,
      addMessage,
      setConversations,
      activeConversationId,
      setActiveConversation,
      activeConversation?.receiptId,
    ]
  );

  const handlePresenceMessage = useCallback((message: any) => {
    if (
      message.type === "online_connections" &&
      message.data?.onlineConnections
    ) {
      setOnlineUsers(message.data.onlineConnections);
    }
  }, []);

  const handleMessageSent = useCallback(
    (message: any) => {
      const { conversationId, data } = message;
      updateMessage(conversationId, data.id, { ...data, status: "delivered" });
    },
    [updateMessage]
  );

  useEffect(() => {
    if (!user?.id || !isConnected) return;

    const unsubscribe = onMessage((message: any) => {
      console.log("[Inbox] Message received:", message);
      switch (message.type) {
        case "new_message":
        case "chat_message":
        case "new_conversation":
          handleChatMessage(message);
          break;
        case "online_connections":
          handlePresenceMessage(message);
          break;
        case "message_sent":
          handleMessageSent(message);
          break;
        case "typing":
          const { conversationId, userId } = message.data;
          setTypingUsers(
            conversationId,
            [...(typingUsers[conversationId] || []), userId].filter(
              (id, i, arr) => arr.indexOf(id) === i
            )
          );
          break;
        case "stop_typing":
          const { conversationId: stopConvoId, userId: stopUserId } =
            message.data;
          setTypingUsers(
            stopConvoId,
            (typingUsers[stopConvoId] || []).filter((id) => id !== stopUserId)
          );
          break;
        case "connection_established":
          console.log(
            `[Inbox] Connection confirmed for user ${message.userId}`
          );
          break;
        case "error":
          console.warn(
            "[Inbox] WebSocket error:",
            message.message,
            message.details
          );
          break;
        default:
          console.warn("[Inbox] Unknown message type:", message.type);
      }
    });

    return () => unsubscribe();
  }, [
    user?.id,
    isConnected,
    onMessage,
    handleChatMessage,
    handlePresenceMessage,
    handleMessageSent,
    setTypingUsers,
    typingUsers,
  ]);

  useEffect(() => {
    if (!user?.id || !isConnected) return;

    if (activeConversationId && activeConversation?.type === "group") {
      send({
        type: "join_conversation",
        data: { conversationId: activeConversationId, userId: user.id },
      });
      console.log(
        `[Inbox] Joining group conversation: ${activeConversationId}`
      );

      if (
        previousConversationId &&
        previousConversationId !== activeConversationId
      ) {
        send({
          type: "leave_conversation",
          data: { previousConversationId },
        });
        console.log(
          `[Inbox] Left previous group conversation: ${previousConversationId}`
        );
      }

      setPreviousConversationId(activeConversationId);
    } else if (previousConversationId) {
      send({
        type: "leave_conversation",
        data: { previousConversationId },
      });
      console.log(
        `[Inbox] Left previous group conversation: ${previousConversationId}`
      );
      setPreviousConversationId(null);
    }
  }, [
    activeConversationId,
    user?.id,
    activeConversation?.type,
    previousConversationId,
    isConnected,
    send,
  ]);

  const handleSendMessage = useCallback(
    async (
      content: string,
      messageType: string = "text",
      attachments: MessageAttachment[] = [],
      tempMessageId?: string
    ): Promise<void> => {
      if (!activeConversationId || !user?.id) return;

      const messageId = tempMessageId || `${crypto.randomUUID()}-${Date.now()}`;
      const optimisticMessage = {
        id: messageId,
        content,
        senderMetadata: {
          id: user.id,
          name: user.name || "Unknown",
          avatar: user.avatar || "",
        },
        createdAt: new Date().toISOString(),
        status: "sent" as const,
        messageType: attachments.length > 0 ? attachments[0].type : messageType,
        attachments,
      };

      addMessage(activeConversationId, optimisticMessage);
      const messageData = {
        type: "chat_message",
        data: { conversationId: activeConversationId, ...optimisticMessage },
      };

      if (isConnected) {
        console.log("[Inbox] Sending message:", messageData);
        if (!send(messageData)) {
          updateMessage(activeConversationId, messageId, {
            ...optimisticMessage,
            status: "failed",
          });
        }
      } else {
        console.log("[Inbox] Queuing message:", messageData);
        updateMessage(activeConversationId, messageId, {
          ...optimisticMessage,
          status: "pending",
        });
      }
    },
    [activeConversationId, user, addMessage, updateMessage, isConnected, send]
  );

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    if (isSelectionMode) setSelectedConversations([]);
  }, [isSelectionMode]);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (!conversationId) {
        console.error("handleSelectConversation: conversationId is undefined");
        return;
      }
      if (isSelectionMode) {
        setSelectedConversations((prev) =>
          prev.includes(conversationId)
            ? prev.filter((id) => id !== conversationId)
            : [...prev, conversationId]
        );
      } else {
        setActiveConversation(conversationId);
        setSheetOpen(false);
      }
    },
    [isSelectionMode, setActiveConversation]
  );

  const toggleConversationSelection = useCallback((conversationId: string) => {
    setSelectedConversations((prev) =>
      prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId]
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    setConversations(
      conversations.filter((conv) => !selectedConversations.includes(conv.id))
    );
    setSelectedConversations([]);
    setIsSelectionMode(false);
  }, [conversations, selectedConversations, setConversations]);

  const handleMarkAsRead = useCallback(() => {
    setConversations(
      conversations.map((conv) =>
        selectedConversations.includes(conv.id) ? { ...conv, unread: 0 } : conv
      )
    );
    setSelectedConversations([]);
    setIsSelectionMode(false);
  }, [conversations, selectedConversations, setConversations]);

  const handleArchiveSelected = useCallback(() => {
    setConversations(
      conversations.map((conv) =>
        selectedConversations.includes(conv.id)
          ? { ...conv, archived: true }
          : conv
      )
    );
    setSelectedConversations([]);
    setIsSelectionMode(false);
  }, [conversations, selectedConversations, setConversations]);

  const handleUnarchiveSelected = useCallback(() => {
    setConversations(
      conversations.map((conv) =>
        selectedConversations.includes(conv.id)
          ? { ...conv, archived: false }
          : conv
      )
    );
    setSelectedConversations([]);
    setIsSelectionMode(false);
  }, [conversations, selectedConversations, setConversations]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const user = uniqueUsers.find((u) => u.id === conv.receiptId);
      return (
        user?.name?.toLowerCase().includes(query) ||
        user?.username.toLowerCase().includes(query) ||
        conv.lastMessage?.toLowerCase().includes(query)
      );
    });
  }, [conversations, searchQuery, uniqueUsers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSelectionMode) toggleSelectionMode();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectionMode, toggleSelectionMode]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };
  const sidebarVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
  };
  const mobileMenuVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      x: "-100%",
      transition: { type: "spring", stiffness: 400, damping: 40 },
    },
  };

  if (!user) return <div>Loading user data...</div>;

  return (
    <motion.div
      className="flex h-screen bg-background relative overflow-hidden w-full max-w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <motion.div
        className="hidden md:block w-80 border-r border-border overflow-hidden shrink-0"
        variants={sidebarVariants}>
        <ConversationList
          conversations={filteredConversations}
          users={uniqueUsers}
          activeConversationId={activeConversationId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={handleSelectConversation}
          isSelectionMode={isSelectionMode}
          selectedConversations={selectedConversations}
          toggleConversationSelection={toggleConversationSelection}
          onDeleteSelected={handleDeleteSelected}
          onMarkAsRead={handleMarkAsRead}
          onArchiveSelected={handleArchiveSelected}
          onUnarchiveSelected={handleUnarchiveSelected}
          currentUser={user}
          toggleSelectionMode={toggleSelectionMode}
          onlineUsers={onlineUsers}
          uniqueUsers={uniqueUsers}
        />
      </motion.div>
      <div className="flex-1 flex flex-col w-full max-w-full">
        {connectionError && (
          <div className="bg-destructive text-destructive-foreground p-2 text-center">
            {connectionError}
          </div>
        )}
        <AnimatePresence mode="wait">
          {activeConversation && activeUser ? (
            <motion.div
              key="active-conversation"
              className="flex-1 flex flex-col h-full w-full max-w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              <MessageView
                conversation={activeConversation}
                frontUser={activeUser}
                activeConversationId={activeConversationId}
                currentUser={user}
                onSendMessage={handleSendMessage}
                isOnline={onlineUsers.includes(activeUser.id)}
                setSheetOpen={setSheetOpen}
                sheetOpen={sheetOpen}
                onBlockUser={() => console.log("Block user")}
                onClearConversation={() => console.log("Clear conversation")}
                onExportChat={() => console.log("Export chat")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="no-conversation"
              className="flex-1 flex items-center justify-center text-muted-foreground w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}>
              {conversations.length > 0 ? (
                <p>Select a conversation to start messaging</p>
              ) : (
                <div className="flex flex-col items-center justify-center gap-y-2">
                  <h3>Press</h3>
                  <CreateConversation uniqueUsers={uniqueUsers} />
                  <h3>to Start a Conversation!</h3>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 w-80 bg-background border-r border-border max-w-full"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit">
              <div className="flex flex-col h-full w-full">
                <div className="py-1 border-b border-border flex justify-between items-center px-2">
                  <Button className="font-semibold" variant="link" asChild>
                    <Link href="/profile">Go to Profile</Link>
                  </Button>
                  <motion.button
                    onClick={() => setSheetOpen(false)}
                    className="p-2 rounded-md hover:bg-muted"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}>
                    <XIcon className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="flex-1 overflow-hidden w-full">
                  <ConversationList
                    conversations={filteredConversations}
                    users={uniqueUsers}
                    activeConversationId={activeConversationId}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSelectConversation={handleSelectConversation}
                    isSelectionMode={isSelectionMode}
                    selectedConversations={selectedConversations}
                    toggleConversationSelection={toggleConversationSelection}
                    onDeleteSelected={handleDeleteSelected}
                    onMarkAsRead={handleMarkAsRead}
                    onArchiveSelected={handleArchiveSelected}
                    onUnarchiveSelected={handleUnarchiveSelected}
                    currentUser={user}
                    toggleSelectionMode={toggleSelectionMode}
                    onlineUsers={onlineUsers}
                    uniqueUsers={uniqueUsers}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
