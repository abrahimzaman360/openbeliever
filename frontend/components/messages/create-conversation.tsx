"use client";
import { useState } from "react";
import { Plus, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SERVER_URL } from "@/lib/server";
import { useConversationStore } from "@/lib/stores/messaging-store";

interface CreateConversationProps {
  uniqueUsers: User[];
}

export default function CreateConversation({
  uniqueUsers,
}: CreateConversationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { conversations, setActiveConversation, createConversation } =
    useConversationStore();

  const handleClose = (isClear: boolean) => {
    setIsOpen(false);
    if (isClear) {
      setSearchQuery("");
    }
  };

  const filteredUsers = uniqueUsers.filter(
    (eachUser) =>
      eachUser.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eachUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const findExistingConversation = (userId: string) => {
    return conversations.find((conv) => conv.receiptId === userId);
  };

  const handleUserClick = async (user: User) => {
    setIsLoading(true);
    const existingConversation = conversations.find(
      (conv) => conv.receiptId === user.id
    );
    if (existingConversation) {
      setActiveConversation(existingConversation.id);
    } else {
      await createConversation(user.id); // HTTP + WebSocket
    }
    handleClose(false);
    setIsLoading(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose(true);
        } else {
          setIsOpen(true);
        }
      }}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="Start a new conversation"
          disabled={isLoading}>
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg w-full max-w-sm p-3">
        <DialogHeader>
          <DialogTitle className="font-bold">
            Start a new conversation
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto pr-1">
            {filteredUsers.length > 0 ? (
              <ul className="space-y-2">
                {filteredUsers.map((user) => {
                  const existingConversation = findExistingConversation(
                    user.id
                  );
                  const conversationExists = !!existingConversation;

                  return (
                    <li key={user.id}>
                      <Button
                        variant="outline"
                        className="w-full justify-between px-2 py-6 border-2"
                        onClick={() => handleUserClick(user)}
                        title={
                          conversationExists
                            ? "Open existing conversation"
                            : "Start new conversation"
                        }
                        disabled={isLoading}>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={`${SERVER_URL}${user.avatar}`}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name?.charAt(0) || user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">
                              {user.name || user.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                        {conversationExists ? (
                          <span className="text-xs text-primary flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            Existing conversation
                          </span>
                        ) : (
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                No connection found
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
