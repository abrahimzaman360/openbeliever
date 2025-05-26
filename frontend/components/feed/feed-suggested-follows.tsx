"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { SERVER_URL } from "@/lib/server";
import Link from "next/link";
import Image from "next/image";

type ReadOnlyUsers = {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  isPrivate: boolean;
};

export default function FeedSuggestedFollows() {
  const [suggestedUsers, setSuggestedUsers] = useState<ReadOnlyUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState<
    Record<number, boolean>
  >({});
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${SERVER_URL}/api/ai-engine/suggestions/follows`,
        {
          credentials: "include",
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSuggestedUsers(data);
      } else {
        setError("Failed to load suggestions");
      }
    } catch (error) {
      console.error("Error fetching suggested users:", error);
      setError("Error loading suggestions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const refreshSuggestions = () => {
    fetchSuggestedUsers();
  };

  return (
    <Card className="p-4">
      <h2 className="mb-4 text-xl font-bold">Suggested to follow</h2>
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : suggestedUsers.length > 0 ? (
          suggestedUsers.map((user) => (
            <div
              key={user.username}
              className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                  <Image
                    width={40}
                    height={40}
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold hover:underline">
                    {user.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              </div>
              <Link href={`/profile/${user.username}` as string}>
                <Button
                  size="sm"
                  variant={followingStatus[user.id] ? "default" : "outline"}
                  disabled={followingStatus[user.id]}>
                  View Profile
                </Button>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            No suggestions available.
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        className="mt-4 w-full justify-center text-muted-foreground rounded-full"
        onClick={refreshSuggestions}>
        Refresh Suggestions
      </Button>
    </Card>
  );
}
