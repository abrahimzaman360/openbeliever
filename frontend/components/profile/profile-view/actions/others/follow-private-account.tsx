"use client";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SERVER_URL } from "@/lib/server";
import { cn } from "@/lib/utils";

type TProps = {
  currentUser: User;
  requestedUser: User;
};

export default function FollowPrivateButton({
  currentUser,
  requestedUser,
}: TProps) {
  const client = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const followMutation = useMutation({
    mutationKey: ["follow-action", requestedUser?.username],
    mutationFn: async () => {
      let endpoint = "/private/request"; // Default to sending a follow request

      if (requestedUser?.requestStatus === "requested") {
        endpoint = "/private/cancel"; // Cancel the follow request
      } else if (requestedUser?.requestStatus === "accepted") {
        endpoint = "/unfollow"; // Unfollow the user
      }

      const res = await fetch(`${SERVER_URL}/api/follow-machine${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          followerId: currentUser!.id,
          followingId: requestedUser!.id,
        }),
      });

      if (res.ok) return res.json();
    },
    onSuccess: () => {
      setLoading(false);
      setIsDialogOpen(false);

      client.refetchQueries({
        queryKey: ["requested-user", requestedUser?.username!],
      });
      client.refetchQueries({
        queryKey: ["user"],
      });
    },
    onError: () => {
      setLoading(false);
      setIsDialogOpen(false);
    },
  });

  const handleFollowAction = () => {
    if (loading) return;
    setIsDialogOpen(true);
  };

  const executeFollowAction = () => {
    setLoading(true);
    setIsDialogOpen(false);
    setTimeout(async () => {
      await followMutation.mutateAsync();
    }, 1000);
  };

  const getButtonText = () => {
    if (loading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    } else if (requestedUser?.requestStatus === "requested") {
      return "Cancel Follow Request";
    } else if (requestedUser?.requestStatus === "accepted") {
      return "Unfollow";
    } else {
      return "Send Follow Request";
    }
  };

  const getDialogContent = () => {
    if (requestedUser?.requestStatus === "requested") {
      return {
        title: "Cancel Follow Request",
        description: "Are you sure you want to cancel your follow request?",
        confirmText: "Yes, Cancel Request",
      };
    } else if (requestedUser?.requestStatus === "accepted") {
      return {
        title: "Unfollow User",
        description:
          "Are you sure you want to unfollow this user? As they are private, you'll need to request to follow them again.",
        confirmText: "Yes, Unfollow",
      };
    } else {
      return {
        title: "Send Follow Request",
        description:
          "This user has a private account. By sending a follow request, you'll need to wait for their approval to see their content.",
        confirmText: "Yes, Send Request",
      };
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          disabled={loading}
          onClick={handleFollowAction}
          className={"rounded-full transition-colors"}
          variant={
            requestedUser?.requestStatus === "accepted" ||
            requestedUser?.requestStatus === "requested"
              ? "outline"
              : "default"
          }>
          {getButtonText()}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getDialogContent().title}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDialogContent().description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn("rounded-full transition-colors", {
              "bg-red-500 hover:bg-red-600":
                requestedUser?.requestStatus === "accepted" ||
                requestedUser?.requestStatus === "requested",
            })}
            onClick={executeFollowAction}>
            {getDialogContent().confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
