"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MoreVertical,
  Archive,
  Trash,
  CheckSquare,
  Square,
  Image as ImgIcon,
  CopyCheck,
  XIcon,
  Delete,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CreateConversation from "./create-conversation";
import { SERVER_URL } from "@/lib/server";
import { motion, AnimatePresence } from "motion/react";
import { useTypingStore } from "@/lib/stores/messaging-store";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import IWebSocket from "@/lib/ws"; // Import IWebSocket directly

interface ConversationListProps {
  conversations: Conversation[];
  users: User[];
  activeConversationId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (current: string) => void;
  isSelectionMode: boolean;
  selectedConversations: string[];
  toggleConversationSelection: (conversationId: string) => void;
  onDeleteSelected: () => void;
  onMarkAsRead: () => void;
  onArchiveSelected: () => void;
  onUnarchiveSelected: () => void;
  currentUser: User;
  onlineUsers: string[];
  uniqueUsers: User[];
  toggleSelectionMode: () => void;
}

export default function ConversationList({
  conversations,
  users,
  activeConversationId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  isSelectionMode,
  selectedConversations,
  toggleConversationSelection,
  onDeleteSelected,
  onMarkAsRead,
  onArchiveSelected,
  onUnarchiveSelected,
  uniqueUsers,
  currentUser,
  onlineUsers,
  toggleSelectionMode,
}: ConversationListProps) {
  const [showArchived, setShowArchived] = useState(false);
  const { typingUsers } = useTypingStore();

  const uniqueConversations = useMemo(() => {
    if (conversations.length === 0) return [];

    const seen = new Set<string>();
    return conversations
      .sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
      )
      .filter((conv) => {
        if (!seen.has(conv.receiptId)) {
          seen.add(conv.receiptId);
          return true;
        }
        return false;
      });
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return uniqueConversations.filter((conv) =>
      showArchived ? conv.archived : !conv.archived
    );
  }, [uniqueConversations, showArchived]);

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Just now";
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSelectionMode) toggleSelectionMode();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectionMode, toggleSelectionMode]);

  useEffect(() => {
    if (
      conversations.length > 0 &&
      !activeConversationId &&
      filteredConversations.length > 0
    ) {
      onSelectConversation(filteredConversations[0].id);
    }
  }, [
    conversations,
    filteredConversations,
    onSelectConversation,
    activeConversationId,
  ]);

  const handleArchiveConversation = (conversationId: string) => {
    if (IWebSocket.isConnected()) {
      IWebSocket.send({ type: "archive_conversation", conversationId });
    } else {
      IWebSocket.queueMessage({ type: "archive_conversation", conversationId });
    }
    // Local update
    onArchiveSelected();
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (IWebSocket.isConnected()) {
      IWebSocket.send({ type: "delete_conversation", conversationId });
    } else {
      IWebSocket.queueMessage({ type: "delete_conversation", conversationId });
    }
    // Local update
    onDeleteSelected();
  };

  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };
  const iconButtonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.9, rotate: 0 },
  };

  return (
    <div className="w-80 border-r border-border flex flex-col h-full">
      <motion.div
        className="p-3 border-b border-border"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <motion.h2
            className="text-xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}>
            Messages
          </motion.h2>
          <div className="flex gap-1">
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap">
              <CreateConversation uniqueUsers={uniqueUsers} />
            </motion.div>
            <AnimatePresence mode="wait">
              {isSelectionMode ? (
                <motion.div
                  key="selection-mode-buttons"
                  className="flex gap-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}>
                  <motion.div
                    variants={iconButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onMarkAsRead}
                      className="h-8 w-8"
                      title="Mark as read">
                      <CopyCheck className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  {showArchived ? (
                    <motion.div
                      variants={iconButtonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onUnarchiveSelected}
                        className="h-8 w-8"
                        title="Unarchive">
                        <Archive className="h-4 w-4 text-primary" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={iconButtonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onArchiveSelected}
                        className="h-8 w-8"
                        title="Archive">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                  <motion.div
                    variants={iconButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onDeleteSelected}
                      className="h-8 w-8"
                      title="Delete">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={iconButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSelectionMode}
                      className="h-8 w-8"
                      title="Exit selection mode">
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="normal-mode-buttons"
                  className="flex gap-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}>
                  <motion.div
                    variants={iconButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSelectionMode}
                      className="h-8 w-8"
                      title="Select conversations">
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={iconButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setShowArchived(!showArchived)}>
                          {showArchived
                            ? "Show Conversations"
                            : "Show Archived"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={onDeleteSelected}>
                          Delete All
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}>
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </motion.div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <motion.div
            className="p-4 text-center text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}>
            {showArchived
              ? "No archived conversations!"
              : "No conversations yet!"}
          </motion.div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-1">
            <AnimatePresence>
              {filteredConversations.map((conversation) => {
                const user = uniqueUsers.find(
                  (u) => u.id === conversation.receiptId
                );
                const isOnline = user ? onlineUsers.includes(user.id) : false;
                const displayUser =
                  user || users.find((u) => u.id === conversation.receiptId);
                if (!displayUser) return null;

                const isSelected = selectedConversations.includes(
                  conversation.id
                );
                const typers = (typingUsers[conversation.id] || []).filter(
                  (id) => id !== currentUser.id!
                );

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group relative flex items-center px-2 py-3 gap-2 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden",
                      activeConversationId === conversation.id &&
                        !isSelectionMode &&
                        "bg-muted",
                      isSelected && "bg-primary/10"
                    )}
                    onClick={(e) => {
                      if (isSelectionMode) {
                        toggleConversationSelection(conversation.id);
                        e.stopPropagation();
                      } else {
                        onSelectConversation(conversation.id);
                      }
                    }}>
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center gap-2 w-full transform transition-transform duration-300 ease-out">
                          <div className="relative flex-shrink-0">
                            <AnimatePresence mode="wait">
                              {isSelectionMode ? (
                                <motion.div
                                  key="checkbox"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  className="h-10 w-10 rounded-full flex items-center justify-center border border-border">
                                  {isSelected ? (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 15,
                                      }}>
                                      <CheckSquare className="h-5 w-5 text-primary" />
                                    </motion.div>
                                  ) : (
                                    <Square className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="avatar"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}>
                                  <Avatar className="h-10 w-10 border border-border">
                                    <AvatarImage
                                      src={`${SERVER_URL}${displayUser.avatar}`}
                                      alt={displayUser.name}
                                    />
                                    <AvatarFallback>
                                      {displayUser.name?.charAt(0) ||
                                        displayUser.username.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <motion.div
                                    className={cn(
                                      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                                      isOnline ? "bg-green-500" : "bg-gray-300"
                                    )}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <motion.h3
                                className="font-medium truncate"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}>
                                {displayUser.name || displayUser.username}
                              </motion.h3>
                              <motion.span
                                className="text-xs text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}>
                                {formatTime(conversation.lastMessageTime)}
                              </motion.span>
                            </div>
                            <div className="flex items-center justify-between">
                              {conversation && (
                                <motion.p
                                  className="text-sm text-muted-foreground truncate"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.15 }}>
                                  {typers.length > 0 ? (
                                    <span className="italic">
                                      {typers.length === 1
                                        ? `${displayUser.name} is typing...`
                                        : "Multiple users are typing..."}
                                    </span>
                                  ) : conversation.lastMessageAttachment ? (
                                    <span className="flex items-center gap-1">
                                      <ImgIcon className="h-4 w-4" />
                                      {conversation.lastMessageAttachment.type}
                                    </span>
                                  ) : (
                                    conversation.lastMessage ||
                                    "No messages yet"
                                  )}
                                </motion.p>
                              )}
                              {conversation.unread > 0 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 15,
                                    delay: 0.2,
                                  }}>
                                  <Badge
                                    variant="default"
                                    className="ml-1 size-5 rounded-full p-0 flex items-center justify-center">
                                    {conversation.unread > 10
                                      ? "9+"
                                      : conversation.unread}
                                  </Badge>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64">
                        <ContextMenuItem
                          inset
                          className="cursor-pointer flex flex-row items-center justify-start"
                          asChild>
                          <Button
                            size="icon"
                            className="w-full"
                            variant="ghost"
                            onClick={() =>
                              handleArchiveConversation(conversation.id)
                            }>
                            <Archive className="h-4 w-4" />
                            Archive conversation
                          </Button>
                        </ContextMenuItem>
                        <ContextMenuItem
                          inset
                          className="cursor-pointer flex flex-row items-center justify-start"
                          asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-full"
                            onClick={() =>
                              handleDeleteConversation(conversation.id)
                            }>
                            <Delete className="h-4 w-4" />
                            Delete conversation
                          </Button>
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
