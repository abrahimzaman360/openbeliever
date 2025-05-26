"use client";
import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  ArrowDown,
  MenuIcon,
  Reply,
  Forward,
  Edit2,
  X,
  SmilePlus,
  Download,
  Trash,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, debounce, formatMessageTime, throttle } from "@/lib/utils";
import MediaAttachment from "./messages-attachment";
import VideoCall from "./calls/video-call";
import AudioCall from "./calls/audio-call";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Image from "next/image";
import { SERVER_URL } from "@/lib/server";
import { motion } from "motion/react";
import {
  useTypingStore,
  useConversationStore,
} from "@/lib/stores/messaging-store";
import TypingIndicator from "./typing_indicator";
import { useWebSocket } from "@/lib/providers/websocket-provider";
import MediaPopup from "./media-popup";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "../ui/emoji-picker";

interface MessageViewProps {
  conversation: Conversation | null;
  frontUser: User | null;
  activeConversationId: string | null;
  currentUser: User;
  onSendMessage: (
    content: string,
    messageType?: string,
    attachments?: MessageAttachment[],
    tempMessageId?: string
  ) => Promise<void>;
  onClearConversation: () => void;
  onBlockUser: () => void;
  onExportChat: () => void;
  isOnline: boolean;
  sheetOpen: boolean;
  setSheetOpen: (value: boolean) => void;
}

interface MessageInputProps {
  messageInput: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

// Memoized MessageInput to prevent unnecessary re-renders
const MessageInput = memo(
  ({
    messageInput,
    placeholder,
    onChange,
    onBlur,
    onKeyDown,
  }: MessageInputProps) => (
    <Textarea
      placeholder={placeholder}
      className="w-full min-h-[60px] max-h-[200px] resize-none pr-12 rounded-lg shadow-lg bg-background/90 backdrop-blur-sm border border-border focus:ring-1 focus:ring-primary overflow-x-hidden"
      rows={1}
      value={messageInput}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      style={{
        wordBreak: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "pre-wrap",
        maxHeight: "200px",
      }}
    />
  )
);
MessageInput.displayName = "MessageInput";

// Memoized Message Component to optimize rendering
const MessageItem = memo(
  ({
    message,
    currentUser,
    frontUser,
    messageReactions,
    handleReplyToMessage,
    handleForwardMessage,
    handleUnsendMessage,
    handleEditMessage,
    handleAddReaction,
    handleOpenMediaPopup,
  }: {
    message: Message;
    currentUser: User;
    frontUser: User;
    messageReactions: Record<string, string>;
    handleReplyToMessage: (message: Message) => void;
    handleForwardMessage: (message: Message) => void;
    handleUnsendMessage: (messageId: string) => void;
    handleEditMessage: (message: Message) => void;
    handleAddReaction: (messageId: string, emoji: string) => void;
    handleOpenMediaPopup: (attachment: MessageAttachment) => void;
  }) => {
    const isCurrentUser = message.senderMetadata.id === currentUser.id;

    return (
      <div
        className={cn(
          "flex gap-2 group py-2",
          isCurrentUser ? "justify-end" : "justify-start"
        )}>
        {!isCurrentUser && (
          <Avatar className="size-10 flex-shrink-0 mt-1">
            <AvatarImage
              src={`${SERVER_URL}${frontUser.avatar}`}
              alt={frontUser.name}
            />
            <AvatarFallback>{frontUser.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        <div className="max-w-[70%] flex flex-col relative">
          <div
            className={cn(
              "rounded-lg p-3",
              isCurrentUser
                ? "bg-green-900 text-primary-foreground"
                : "bg-muted"
            )}>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <MediaAttachment
                    key={attachment.id}
                    src={attachment.url}
                    isCurrentUser={isCurrentUser}
                    onExpand={() => handleOpenMediaPopup(attachment)}
                  />
                ))}
              </div>
            )}
            {message.content && message.content !== "attachment" && (
              <p className="text-sm break-words whitespace-pre-wrap">
                {message.content}
              </p>
            )}
            <div className="flex justify-end items-center gap-1 mt-1">
              <span className="text-xs opacity-70">
                {formatMessageTime(message.createdAt)}
              </span>
              {isCurrentUser && (
                <span className="text-xs opacity-70">
                  {message.status === "delivered" ? (
                    <span className="text-blue-600">✓✓</span>
                  ) : message.status === "failed" ? (
                    <span className="text-red-600">!</span>
                  ) : (
                    "✓"
                  )}
                </span>
              )}
            </div>
          </div>
          {messageReactions[message.id] && (
            <div className="flex justify-end mt-1">
              <span className="text-sm bg-background/30 rounded-full px-2 py-0.5">
                {messageReactions[message.id]}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm">
                  <Smile className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-1 w-[250px]" side="top">
                <div className="grid grid-cols-6 gap-1">
                  {[
                    "👍",
                    "❤️",
                    "😂",
                    "😮",
                    "😢",
                    "😡",
                    "👏",
                    "🎉",
                    "🔥",
                    "🙏",
                    "💯",
                    "✅",
                  ].map((emoji) => (
                    <button
                      key={emoji}
                      className="text-lg p-1 hover:bg-muted rounded-md"
                      onClick={() => handleAddReaction(message.id, emoji)}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => handleReplyToMessage(message)}>
              <Reply className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => handleForwardMessage(message)}>
              <Forward className="h-3 w-3" />
            </Button>
            {isCurrentUser && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={() => handleEditMessage(message)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={() => handleUnsendMessage(message.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);
MessageItem.displayName = "MessageItem";

export default function MessageView({
  conversation,
  frontUser,
  activeConversationId,
  currentUser,
  onSendMessage,
  onClearConversation,
  onBlockUser,
  onExportChat,
  isOnline,
  sheetOpen,
  setSheetOpen,
}: MessageViewProps) {
  const [messageInput, setMessageInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [messageReactions, setMessageReactions] = useState<
    Record<string, string>
  >({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const [activeCall, setActiveCall] = useState<"video" | "audio" | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { typingUsers } = useTypingStore();
  const { isConnected, send } = useWebSocket();
  const { conversations, fetchMoreMessages } = useConversationStore();
  const [mediaPopup, setMediaPopup] = useState<{
    media: MessageAttachment[];
    initialIndex: number;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const messages = React.useMemo(
    () => (conversation?.messages || []).slice(-100), // Limit to last 100 messages
    [conversation?.messages]
  );

  const typers = React.useMemo(
    () =>
      (typingUsers[activeConversationId || ""] || []).filter(
        (id) => id !== currentUser.id
      ),
    [typingUsers, activeConversationId, currentUser.id]
  );

  const allMedia = React.useMemo(
    () =>
      messages
        .flatMap((msg) => msg.attachments || [])
        .filter((att) => att.type === "image" || att.type === "video"),
    [messages]
  );

  const isNearBottom = useCallback(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return false;
    const { scrollHeight, scrollTop, clientHeight } = scrollElement;
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  const scrollToBottom = useCallback((behavior: "smooth" | "auto" = "auto") => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;
    scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior });
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversationId || !hasMore) return;
    const result = await fetchMoreMessages(activeConversationId, page);
    if (result.success) {
      setPage((prev) => prev + 1);
      setHasMore(result.hasMore);
    }
  }, [activeConversationId, page, hasMore, fetchMoreMessages]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = throttle(() => {
      if (!scrollElement) return;
      const messagesElements = scrollElement.children;
      let notVisibleCount = 0;
      for (let i = 0; i < messagesElements.length; i++) {
        const msg = messagesElements[i] as HTMLElement;
        if (msg.offsetTop + msg.offsetHeight <= scrollElement.scrollTop) {
          notVisibleCount++;
        } else {
          break; // Stop once we hit a visible message
        }
      }
      setShowScrollToBottom(notVisibleCount >= 10);
      if (scrollElement.scrollTop < 100 && hasMore) loadMoreMessages();
    }, 200);

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadMoreMessages, messages.length]);

  useEffect(() => {
    if (!messages.length || !parentRef.current) return;
    const latestMessage = messages[messages.length - 1];
    const wasNearBottom = isNearBottom();
    const isNewMessage = lastMessageIdRef.current !== latestMessage.id;

    if (wasNearBottom || isNewMessage) {
      setTimeout(() => {
        scrollToBottom("smooth");
        lastMessageIdRef.current = latestMessage.id;
      }, 100);
    }
  }, [messages, scrollToBottom, isNearBottom]);

  const sendTypingIndicatorThrottled = React.useMemo(
    () =>
      throttle((conversationId: string, userId: string) => {
        if (isConnected && conversationId) {
          send({ type: "typing", data: { conversationId, userId } });
        }
      }, 2000),
    [isConnected, send]
  );

  const stopTypingIndicatorDebounced = React.useMemo(
    () =>
      debounce((conversationId: string, userId: string) => {
        if (isConnected && conversationId) {
          send({ type: "stop_typing", data: { conversationId, userId } });
        }
      }, 2000),
    [isConnected, send]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setMessageInput(value);
      if (value.trim() && activeConversationId) {
        sendTypingIndicatorThrottled(activeConversationId, currentUser.id);
        stopTypingIndicatorDebounced(activeConversationId, currentUser.id);
      }
    },
    [
      activeConversationId,
      currentUser.id,
      sendTypingIndicatorThrottled,
      stopTypingIndicatorDebounced,
    ]
  );

  const handleBlur = useCallback(() => {
    if (activeConversationId) stopTypingIndicatorDebounced.flush();
  }, [activeConversationId, stopTypingIndicatorDebounced]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const newFiles = Array.from(files).slice(0, 5);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      const tempAttachments: MessageAttachment[] = newFiles.map((file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        type: file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "file",
        size: file.size,
        name: file.name,
        isLocalPreview: true,
      }));
      setAttachments((prev) => [...prev, ...tempAttachments]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const handleReplyToMessage = useCallback(
    (message: Message) => setReplyingTo(message),
    []
  );
  const handleForwardMessage = useCallback(
    (message: Message) => alert(`Forwarding: ${message.content}`),
    []
  );
  const handleUnsendMessage = useCallback(
    (messageId: string) => alert(`Unsending: ${messageId}`),
    []
  );
  const handleEditMessage = useCallback((message: Message) => {
    setEditingMessage(message);
    setMessageInput(message.content);
  }, []);
  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
    setMessageInput("");
  }, []);
  const cancelReply = useCallback(() => setReplyingTo(null), []);
  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    setMessageReactions((prev) => ({ ...prev, [messageId]: emoji }));
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() && selectedFiles.length === 0) return;
    if (isUploading) return;

    setIsUploading(true);
    setError(null);
    let uploadedAttachments: MessageAttachment[] = [];
    const tempMessageId = `${crypto.randomUUID()}-${Date.now()}`;

    try {
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("attachment", file));
        formData.append("conversationId", conversation!.id);

        const res = await fetch(
          `${SERVER_URL}/api/chat-engine/conversations/upload-attachments`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!res.ok) throw new Error("Failed to upload attachments");
        const data = await res.json();
        uploadedAttachments = data.attachments.map((att: any) => ({
          ...att,
          url: `${SERVER_URL}${att.url}`,
        }));
      }

      const messageData = {
        content:
          messageInput.trim() ||
          (uploadedAttachments.length > 0 ? "attachment" : ""),
        messageType:
          uploadedAttachments.length > 0 ? uploadedAttachments[0].type : "text",
        attachments: uploadedAttachments,
        replyTo: replyingTo?.id,
      };

      await onSendMessage(
        messageData.content,
        messageData.messageType,
        messageData.attachments,
        tempMessageId
      );
      setMessageInput("");
      setAttachments([]);
      setSelectedFiles([]);
      setReplyingTo(null);
      stopTypingIndicatorDebounced.flush();
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message.");
    } finally {
      setIsUploading(false);
    }
  }, [
    messageInput,
    selectedFiles,
    isUploading,
    conversation,
    onSendMessage,
    replyingTo,
    stopTypingIndicatorDebounced,
  ]);

  const removeAttachment = useCallback(
    (index: number) => {
      if (attachments[index]?.isLocalPreview)
        URL.revokeObjectURL(attachments[index].url);
      setAttachments((prev) => prev.filter((_, i) => i !== index));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [attachments]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      } else if (e.key === "Escape") {
        if (editingMessage) cancelEdit();
        else if (replyingTo) cancelReply();
      }
    },
    [handleSendMessage, editingMessage, cancelEdit, replyingTo, cancelReply]
  );

  const initiateVideoCall = useCallback(() => setActiveCall("video"), []);
  const initiateAudioCall = useCallback(() => setActiveCall("audio"), []);

  const handleOpenMediaPopup = useCallback(
    (attachment: MessageAttachment) => {
      const index = allMedia.findIndex((att) => att.id === attachment.id);
      setMediaPopup({ media: allMedia, initialIndex: index });
    },
    [allMedia]
  );

  if (!conversation || !frontUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading conversation...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-full overflow-x-hidden">
      {activeCall === "video" && (
        <VideoCall user={frontUser} onEndCall={() => setActiveCall(null)} />
      )}
      {activeCall === "audio" && (
        <AudioCall user={frontUser} onEndCall={() => setActiveCall(null)} />
      )}
      {!activeCall && (
        <div className="flex flex-col h-full overflow-x-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between shrink-0 overflow-x-hidden">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setSheetOpen(!sheetOpen)}
                className="p-2 rounded-md hover:bg-muted block md:hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}>
                <MenuIcon className="h-5 w-5" />
              </motion.button>
              <div className="relative">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage
                    src={`${SERVER_URL}${frontUser.avatar}`}
                    alt={frontUser.name}
                  />
                  <AvatarFallback>
                    {frontUser.name?.charAt(0) || frontUser.username.charAt(0)}
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
              </div>
              <div>
                <h2 className="font-medium truncate">{frontUser.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={initiateAudioCall}>
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={initiateVideoCall}>
                <Video className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onClearConversation}>
                    <Trash className="h-4 w-4 mr-2" /> Clear conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onBlockUser}>
                    <Ban className="h-4 w-4 mr-2" /> Block user
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportChat}>
                    <Download className="h-4 w-4 mr-2" /> Export chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 flex flex-col relative overflow-x-hidden w-full max-w-full">
            <div
              ref={parentRef}
              className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                  frontUser={frontUser}
                  messageReactions={messageReactions}
                  handleReplyToMessage={handleReplyToMessage}
                  handleForwardMessage={handleForwardMessage}
                  handleUnsendMessage={handleUnsendMessage}
                  handleEditMessage={handleEditMessage}
                  handleAddReaction={handleAddReaction}
                  handleOpenMediaPopup={handleOpenMediaPopup}
                />
              ))}
            </div>
            {showScrollToBottom && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                <Button
                  onClick={() => scrollToBottom("smooth")}
                  size="icon"
                  variant="secondary"
                  className="rounded-full h-10 w-10 shadow-lg bg-background/80 backdrop-blur-sm">
                  <ArrowDown className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
            {typers.length > 0 && (
              <div className="px-4 pb-1 shrink-0 overflow-x-hidden">
                <TypingIndicator />
              </div>
            )}
          </div>

          {(replyingTo || editingMessage) && (
            <div className="px-3 py-2 border-t border-border bg-muted/50 flex items-center justify-between overflow-x-hidden">
              <div className="flex items-center gap-2">
                {replyingTo && (
                  <>
                    <Reply className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Replying to message:
                    </span>
                    <span className="text-sm truncate max-w-[200px]">
                      {replyingTo.content.substring(0, 30)}
                      {replyingTo.content.length > 30 ? "..." : ""}
                    </span>
                  </>
                )}
                {editingMessage && (
                  <>
                    <Edit2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Editing message</span>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={editingMessage ? cancelEdit : cancelReply}>
                Cancel
              </Button>
            </div>
          )}

          <div className="p-3 border-t border-border shrink-0 overflow-x-hidden">
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap overflow-x-hidden">
                {attachments.map((attachment, index) => (
                  <div
                    key={attachment.id || index}
                    className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={
                        attachment.isLocalPreview
                          ? attachment.url
                          : `${SERVER_URL}${attachment.url}`
                      }
                      alt="Attachment"
                      width={80}
                      height={80}
                      className="h-full w-full object-cover rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-5 w-5 absolute top-1 right-1 rounded-full"
                      onClick={() => removeAttachment(index)}>
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 relative overflow-x-hidden">
              <div className="flex-1 relative">
                <MessageInput
                  messageInput={messageInput}
                  placeholder={
                    editingMessage
                      ? "Edit your message..."
                      : "Type a message..."
                  }
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <Popover onOpenChange={setIsOpen} open={isOpen}>
                    <PopoverTrigger asChild>
                      <SmilePlus className="size-5 cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-0">
                      <EmojiPicker
                        className="h-[342px]"
                        onEmojiSelect={({ emoji }) =>
                          setMessageInput((prev) => prev + emoji)
                        }>
                        <EmojiPickerSearch />
                        <EmojiPickerContent />
                        <EmojiPickerFooter />
                      </EmojiPicker>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/jpeg, image/png, image/gif, image/webp, image/jpg, video/mp4, video/webm, audio/mp3, audio/wav, audio/.flac"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button onClick={handleSendMessage} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Uploading...
                    </>
                  ) : editingMessage ? (
                    <>
                      <Edit2 className="h-5 w-5 mr-1" /> Update
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-1" /> Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {mediaPopup && (
        <MediaPopup
          media={mediaPopup.media}
          initialIndex={mediaPopup.initialIndex}
          onClose={() => setMediaPopup(null)}
        />
      )}
    </div>
  );
}
