"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";
import Link from "next/link";
import { SERVER_URL } from "@/lib/server";
import { DialogDescription } from "@radix-ui/react-dialog";

type ReadonlyUser = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  requestStatus: "pending" | "accepted";
};

type TUserProps = {
  beingStalked: User;
  disabled: boolean;
};

export default function OthersSocialCircle({
  beingStalked,
  disabled,
}: TUserProps) {
  const [activeTab, setActiveTab] = useState("followers");
  const [searchQuery, setSearchQuery] = useState("");

  // Search System:
  const normalize = (str: string) => str.trim().toLowerCase();

  const filteredFollowers = beingStalked.followers?.list.filter((follower) => {
    const query = normalize(searchQuery);
    const name = normalize(follower.name ?? follower.username);
    const username = normalize(follower.username!);

    // Match if query exists in name or username
    return name.includes(query) || username.includes(query);
  });

  const filteredFollowing = beingStalked.followings?.list.filter(
    (following) => {
      const query = normalize(searchQuery);
      const name = normalize(following.name ?? following.username);
      const username = normalize(following.username);

      // Match if query exists in name or username
      return name.includes(query) || username.includes(query);
    }
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div whileTap={{ scale: 0.92 }}>
          <Button variant="default" className="rounded-full">
            Social Circle
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="min-w-[400px] sm:max-w-[510px] rounded-md">
        <DialogHeader>
          <DialogTitle className="font-bold">
            {beingStalked.name}&apos;s Social Circle
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="followers"
          className="w-full"
          onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <div className="mt-1 relative">
            <Input
              type="text"
              placeholder={`Search ${activeTab}`}
              value={searchQuery}
              disabled={
                (activeTab === "followers" &&
                  beingStalked.followers?.total <= 0) ||
                (activeTab === "following" &&
                  beingStalked.followings?.total <= 0)
              }
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery ? (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchQuery("")}>
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
          </div>
          <TabsContent value="followers">
            <UserList
              users={filteredFollowers!}
              currentUsername={beingStalked.username}
            />
          </TabsContent>
          <TabsContent value="following">
            <UserList
              users={filteredFollowing!}
              currentUsername={beingStalked.username}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function UserList({
  users,
  currentUsername,
}: {
  users: ReadonlyUser[];
  currentUsername: string;
}) {
  return (
    <div className="mt-4 space-y-2">
      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.username}
            className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={`${SERVER_URL}${user.avatar}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <AvatarFallback>{user.name?.at(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>

            <Link
              href={
                currentUsername === user.username
                  ? "/account/profile"
                  : `/profile/${user.username}`
              }>
              <Button variant={"default"} size="sm">
                {currentUsername === user.username
                  ? "Go to Profile"
                  : "View Profile"}
              </Button>
            </Link>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground">No users found</p>
      )}
    </div>
  );
}
