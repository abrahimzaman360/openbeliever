"use client";
import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DialogDescription } from "@radix-ui/react-dialog";

interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
}

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  media: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  saved: boolean;
}

export default function PostViewDialog() {
  // This would typically come from your data source
  const [post, setPost] = useState<Post>({
    id: "1",
    author: {
      name: "Jane Cooper",
      username: "janecooper",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content:
      "Just finished this amazing project! What do you think? #design #creativity",
    media: "/placeholder.svg?height=600&width=600",
    timestamp: new Date(Date.now() - 3600000 * 3), // 3 hours ago
    likes: 142,
    comments: [
      {
        id: "c1",
        author: {
          name: "Alex Johnson",
          username: "alexj",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content: "This looks incredible! Love the attention to detail 👏",
        timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
        likes: 12,
      },
      {
        id: "c2",
        author: {
          name: "Sam Wilson",
          username: "samw",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content: "Amazing work as always! How long did this take you?",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        likes: 5,
      },
    ],
    saved: false,
  });

  const toggleLike = () => {
    setPost((prev) => ({
      ...prev,
      likes: prev.likes + 1,
    }));
  };

  const toggleSave = () => {
    setPost((prev) => ({
      ...prev,
      saved: !prev.saved,
    }));
  };

  return (
    <Dialog>
      <DialogHeader>
        <DialogDescription className="hidden"></DialogDescription>
      </DialogHeader>
      <DialogTrigger asChild>
        <div className="cursor-pointer border rounded-md overflow-hidden max-w-md mx-auto">
          <div className="p-4 flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-sm text-muted-foreground">
                @{post.author.username}
              </div>
            </div>
          </div>
          <Image
            src={post.media || "/placeholder.svg"}
            alt="Post image"
            width={600}
            height={600}
            className="w-full aspect-square object-cover"
          />
          <div className="p-4">
            <p className="line-clamp-2">{post.content}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              Click to view post
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-[1fr,1fr] h-full max-h-[80vh]">
          {/* Left side - Media */}
          <div className="bg-black flex items-center justify-center">
            <Image
              src={post.media || "/placeholder.svg"}
              alt="Post image"
              width={600}
              height={600}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right side - Content */}
          <div className="flex flex-col h-full max-h-[80vh]">
            {/* Author info */}
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={post.author.avatar}
                    alt={post.author.name}
                  />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center gap-1">
                    {post.author.name}
                    {post.author.verified && (
                      <svg
                        className="w-4 h-4 text-blue-500 fill-current"
                        viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    @{post.author.username}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </div>

            {/* Content and comments */}
            <div className="flex-1 overflow-y-auto">
              {/* Post content */}
              <div className="p-4 border-b">
                <p>{post.content}</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                </div>
              </div>

              {/* Comments */}
              <div className="p-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="mb-4">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={comment.author.avatar}
                          alt={comment.author.name}
                        />
                        <AvatarFallback>
                          {comment.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-start">
                          <span className="font-medium mr-2">
                            {comment.author.username}
                          </span>
                          <span>{comment.content}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(comment.timestamp, {
                              addSuffix: true,
                            })}
                          </span>
                          <span>{comment.likes} likes</span>
                          <button className="hover:text-foreground">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reactions */}
            <div className="border-t p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleLike}>
                    <Heart
                      className={`h-6 w-6 ${
                        post.likes > 141 ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    <span className="sr-only">Like</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-6 w-6" />
                    <span className="sr-only">Comment</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-6 w-6" />
                    <span className="sr-only">Share</span>
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleSave}>
                  <Bookmark
                    className={`h-6 w-6 ${post.saved ? "fill-current" : ""}`}
                  />
                  <span className="sr-only">Save</span>
                </Button>
              </div>

              <div className="font-medium">{post.likes} likes</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(post.timestamp, { addSuffix: true })}
              </div>

              <Separator className="my-3" />

              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="Your avatar"
                  />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent outline-none"
                />
                <Button variant="ghost" size="sm">
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
