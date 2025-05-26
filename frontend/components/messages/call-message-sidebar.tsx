"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SERVER_URL } from "@/lib/server";

interface CallMessageSidebarProps {
  user: User;
}

interface CallMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
}

export default function CallMessageSidebar({ user }: CallMessageSidebarProps) {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<CallMessage[]>([
    {
      id: "1",
      content: "Can you hear me?",
      senderId: "current-user",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: "2",
      content: "Yes, I can hear you clearly!",
      senderId: user.username,
      timestamp: new Date(Date.now() - 90000),
    },
  ]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: CallMessage = {
        id: Date.now().toString(),
        content: messageInput.trim(),
        senderId: "current-user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessageInput("");
      setShowEmojiPicker(false);

      // Simulate response from the other user
      setTimeout(() => {
        const responses = [
          "Got it!",
          "I understand",
          "Let me check that",
          "One moment please",
          "Thanks for letting me know",
          "I'll be right with you",
        ];

        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];

        const responseMessage: CallMessage = {
          id: Date.now().toString(),
          content: randomResponse,
          senderId: user.username,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, responseMessage]);
      }, 2000 + Math.random() * 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === "current-user";

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                isCurrentUser ? "justify-end" : "justify-start"
              )}>
              {!isCurrentUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={`${SERVER_URL}${user.avatar}`}
                    alt={user.name}
                  />
                  <AvatarFallback>{user.name!.charAt(0)}</AvatarFallback>
                </Avatar>
              )}

              <div className="max-w-[75%]">
                <div
                  className={cn(
                    "rounded-lg p-2",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMessageTime(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-border">
        <div className="relative">
          <Textarea
            placeholder="Type a message..."
            className="min-h-[60px] resize-none pr-10"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              {/* <EmojiPicker onEmojiSelect={handleEmojiSelect} /> */}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-2">
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
