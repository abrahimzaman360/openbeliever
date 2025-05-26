"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePostInteraction } from "./mutations/interaction-mutation";
import { Heart, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import ShareStory from "./post-share";
import { useAuth } from "@/lib/providers/auth-provider";

export default function PostInteractions({ post }: { post: Post }) {
  const { user } = useAuth();
  const [interactionStates, setInteractionStates] = useState(() => ({
    isLiked: post.likes?.find((like) => like.userId === user?.id)
      ? true
      : false,
    isFavorite: post.favorites?.find((fav) => fav.userId === user?.id)
      ? true
      : false,
  }));

  const [interactionCounts, setInteractionCounts] = useState({
    likes: post.likes?.length ?? 0,
    favorites: post.favorites?.length ?? 0,
  });

  // Keep states in sync with post updates
  useEffect(() => {
    setInteractionStates({
      isLiked: post.likes?.some((like) => like.userId === user?.id) ?? false,
      isFavorite:
        post.favorites?.some((fav) => fav.userId === user?.id) ?? false,
    });

    setInteractionCounts({
      likes: post.likes?.length ?? 0,
      favorites: post.favorites?.length ?? 0,
    });
  }, [post, user]);

  const postInteraction = usePostInteraction();
  const queryClient = new QueryClient();

  const handleInteraction = async (type: InteractionType) => {
    try {
      await postInteraction.mutateAsync({
        type,
        postId: post.id,
      });

      setInteractionStates((prev) => {
        const newState = { ...prev };
        if (type === "like") {
          setInteractionCounts((counts) => ({
            ...counts,
            likes: counts.likes + (!prev.isLiked ? 1 : -1),
          }));
          newState.isLiked = !prev.isLiked;
        }
        if (type === "favorite") {
          setInteractionCounts((counts) => ({
            ...counts,
            favorites: counts.favorites + (!prev.isFavorite ? 1 : -1),
          }));
          newState.isFavorite = !prev.isFavorite;
        }
        return newState;
      });

      queryClient.refetchQueries({ queryKey: ["discover", post.id] });
    } catch (error) {
      console.error("Interaction failed:", error);
    }
  };

  return (
    <div className="flex flex-row gap-2 items-center justify-between w-full">
      <Button
        variant="outline"
        className="border-none cursor-pointer hover:shadow shadow-none hover:border bg-transparent hover:bg-neutral-50"
        size="sm"
        onClick={() => handleInteraction("like")}
        disabled={postInteraction.isPending}>
        <Heart
          className={cn(
            "mr h-4 w-4 transition-colors",
            interactionStates.isLiked ? "text-red-500 fill-red-500" : ""
          )}
        />
        <span>{interactionCounts.likes}</span>
      </Button>

      <Button
        variant="outline"
        className="border-none cursor-pointer hover:shadow shadow-none hover:border bg-transparent hover:bg-neutral-50"
        size="sm"
        onClick={() => handleInteraction("favorite")}
        disabled={postInteraction.isPending}>
        <Bookmark
          className={cn(
            "mr h-4 w-4 transition-colors",
            interactionStates.isFavorite
              ? "text-yellow-500 fill-yellow-500"
              : ""
          )}
        />
        <span>{interactionCounts.favorites}</span>
      </Button>

      <ShareStory url={`https://openbeliever.com/posts/${post.id}`} />
    </div>
  );
}
