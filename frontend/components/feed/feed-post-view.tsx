import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EllipsisVertical, MoveRight } from "lucide-react";
import "@splidejs/react-splide/css";
import Link from "next/link";
import { cn, formatTimeAgo } from "@/lib/utils";
import PostInteractions from "../post/post-interaction";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PostMediaView from "./feed-post-media";
import { SERVER_URL } from "@/lib/server";

interface ThinkTankPostProps {
  post: Post;
}

export function ThinkTankPost({ post }: ThinkTankPostProps) {
  const MAX_CONTENT_LENGTH = 240;

  return (
    <Card className="w-full gap-0 mx-auto rounded-lg py-0 my-0">
      <CardHeader className="flex flex-row justify-between items-center py-4 rounded-t-lg border-b-1">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar
              className={cn(
                "size-8 md:size-10 border-2 hover:drop-shadow-md hover:scale-105"
              )}>
              <AvatarImage
                src={`${SERVER_URL}${post.author.avatar}`}
                alt={post.author.name || post.author.username}
              />
              <AvatarFallback>
                {post.author.name?.[0] || post.author.username[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/profile/${post.author.username}`}
              className="font-medium text-sm">
              {post.author.name || post.author.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              @{post.author.username} • {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="focus:ring-0 focus:ring-offset-0">
              <EllipsisVertical className="w-5 h-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                  }}>
                  Report this post
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="w-full max-w-md rounded-md">
                <DialogHeader>
                  <DialogTitle>Report this post</DialogTitle>
                  <DialogDescription>
                    Help us understand why you want to report this post. Your
                    report will be reviewed by our team.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-1">
                  <textarea
                    className="w-full h-32 p-2 border resize-none border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Reason for reporting"
                    rows={4}
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="hide-posts" />
                    <label
                      htmlFor="hide-posts"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      Hide future posts from this user
                    </label>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>Submit Report</Button>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col justify-between size-full pt-2 pb-4 flex-1 px-4 overflow-hidden bg-gray-50 ">
        <div>
          <p className="text-gray-800">
            {post.content.length > MAX_CONTENT_LENGTH
              ? `${post.content.slice(0, MAX_CONTENT_LENGTH)}...`
              : post.content}
          </p>
          {post.content.length > MAX_CONTENT_LENGTH && (
            <Link
              href={`/post/${post.id}`}
              className="text-blue-500 hover:underline flex items-center mt-1 text-sm">
              Read full story
              <MoveRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
        <PostMediaView attachments={post.attachments} />
      </CardContent>
      <CardFooter className="border-t-1 rounded-b-lg px-6 py-4 my-0 shadow-sm">
        <PostInteractions post={post} />
      </CardFooter>
    </Card>
  );
}
