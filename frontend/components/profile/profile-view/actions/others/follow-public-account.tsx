"use client";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SERVER_URL } from "@/lib/server";
import { cn } from "@/lib/utils";

type TProps = {
  currentUser: User;
  requestedUser: User;
  isFollowing: boolean;
  onFollowChange: (isFollowing: boolean) => void; // Add this prop
};

export default function PublicFollowButton({
  currentUser,
  requestedUser,
  isFollowing,
  onFollowChange, // Add this prop
}: TProps) {
  const queryClient = useQueryClient();
  const [localIsFollowing, setLocalIsFollowing] =
    useState<boolean>(isFollowing);

  const { mutate, isPending } = useMutation({
    mutationKey: [
      "follow-action",
      currentUser?.username,
      requestedUser?.username,
    ],
    mutationFn: async () => {
      const res = await fetch(
        `${SERVER_URL}/api/follow-machine/${
          localIsFollowing ? "unfollow" : "follow"
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            followerId: currentUser!.id,
            followingId: requestedUser!.id,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update follow status");
      }
      return res.json();
    },
    onSuccess: () => {
      setLocalIsFollowing(!localIsFollowing);
      onFollowChange(!localIsFollowing); // Update parent state
      queryClient.invalidateQueries({
        queryKey: ["user", "requested-user", requestedUser?.username],
      });
    },
    onError: (error) => {
      console.error("Error updating follow status:", error);
    },
    retry: false,
  });

  useEffect(() => {
    setLocalIsFollowing(isFollowing);
  }, [isFollowing]);

  return (
    <Button
      onClick={() => {
        // wait for a second before calling mutate
        setTimeout(async () => {
          mutate();
        }, 1000);
      }}
      className={"rounded-full transition-all"}
      variant={localIsFollowing ? "outline" : "default"}
      disabled={isPending}>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : localIsFollowing ? (
        "Unfollow"
      ) : (
        "Start Following"
      )}
    </Button>
  );
}
