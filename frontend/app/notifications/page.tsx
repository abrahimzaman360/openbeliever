"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SERVER_URL } from "@/lib/server";
import { formatTimeAgo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { BellElectric, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type ReadonlyUser = {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
};

type Notification = {
  id: number;
  type: string;
  data: {
    message?: string;
    user: ReadonlyUser | null; // Allow null
    read_at: string | null;
  };
  is_read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[] | []>([]);

  const { data, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/notifications/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data);
      console.log(data);
    }

    return () => {
      setNotifications([]);
    };
  }, [data]);

  return (
    <div className="max-w-full mx-auto">
      {!isLoading && notifications ? (
        <div className="flex flex-col space-y-1">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id} // Ensuring that each item has a unique key
                avatar={notification.data.user!.avatar || ""}
                name={notification.data.user!.name}
                username={notification.data.user!.username}
                create_At={notification.createdAt}
                unread={notification.data.read_at === null}
                type={notification.type}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-y-2">
              <BellElectric className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No Notifications Yet!</p>
            </div>
          )}
        </div>
      ) : (
        <NotificationsSkeleton />
      )}
    </div>
  );
}

interface NotificationItemProps {
  avatar?: string;
  name: string;
  username: string;
  type: string;
  create_At: string;
  unread?: boolean;
}

function NotificationItem({
  avatar,
  name,
  username,
  type,
  create_At,
  unread = false,
}: NotificationItemProps) {
  const avatarSrc = avatar ? `${SERVER_URL}${avatar}` : "";

  return (
    <Link
      href={
        type === "follow" || type === "request_accepted"
          ? `/profile/${username}`
          : "/profile"
      }
      className={`p-4 flex items-center hover:bg-muted/30 rounded-sm border ${
        unread ? "bg-muted/30" : ""
      }`}>
      <div className="flex-shrink-0 mr-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarSrc} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="font-semibold">{name}</span>
          <span className="text-muted-foreground">(@{username})</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {formatTimeAgo(create_At)}
          </span>
          {unread && (
            <span className="h-2 w-2 rounded-full bg-primary ml-1"></span>
          )}
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">
            {type === "follow" && "Started following you."}
            {type === "follow_request" && (
              <span>
                Sent you a follow request{" "}
                <span className="text-primary">
                  (Actions in My Social Circle {">"} Requests)
                </span>
                .
              </span>
            )}
            {type === "request_accepted" && "Accepted your follow request."}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        <UserPlus className="h-5 w-5 text-muted-foreground" />
      </div>
    </Link>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
