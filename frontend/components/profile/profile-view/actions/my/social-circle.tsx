"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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
import { toast } from "@/hooks/use-toast";
import { motion } from "motion/react";
import { SERVER_URL } from "@/lib/server";
import Link from "next/link";

type ReadonlyUser = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  requestStatus: "pending" | "accepted";
};

type TUserProps = {
  currentUser: User;
};

export default function MySocialCircle({ currentUser }: TUserProps) {
  const client = useQueryClient();
  const [activeTab, setActiveTab] = useState("followers");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const requestMutation = useMutation({
    mutationKey: ["social-circle"],
    mutationFn: async ({
      followerId,
      status,
    }: {
      followerId: number;
      status: "accept" | "reject";
    }) => {
      setLoading(true);
      const res = await fetch(
        `${SERVER_URL}/api/follow-machine/private/${status}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            followerId: followerId,
            followingId: currentUser.id,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Error from the backend");
      }

      return res.json();
    },
    onSuccess: () => {
      setLoading(false);
      toast({
        title: "Request operation sucessful!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Request operation unsucessful!",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      client.refetchQueries({
        queryKey: ["user"],
      });
      client.refetchQueries({
        queryKey: ["social-circle"],
      });
    },
  });

  // Search System:
  const normalize = (str: string) => str.trim().toLowerCase();

  const filteredFollowers = currentUser.followers.list.filter((follower) => {
    const query = normalize(searchQuery);
    const name = normalize(follower.name ?? follower.username);
    const username = normalize(follower.username!);

    // Match if query exists in name or username
    return name.includes(query) || username.includes(query);
  });

  const filteredFollowing = currentUser.followings.list.filter((following) => {
    const query = normalize(searchQuery);
    const name = normalize(following.name ?? following.username);
    const username = normalize(following.username);

    // Match if query exists in name or username
    return name.includes(query) || username.includes(query);
  });

  const filteredRequests = currentUser?.requests?.list.filter((request) => {
    const query = normalize(searchQuery);
    const name = normalize(request.name ?? request.username);
    const username = normalize(request.username);

    // Match if query exists in name or username
    return name.includes(query) || username.includes(query);
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div whileTap={{ scale: 0.92 }}>
          <Button variant="default" className="rounded-full">
            My Social Circle
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="w-full max-w-sm sm:max-w-[510px] rounded-md pt-0 px-4 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="font-bold hidden">
            Your Social Circle
          </DialogTitle>
          <DialogDescription className="hidden">
            Profile Social Circle
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="followers"
          className="w-full"
          onValueChange={setActiveTab}>
          <TabsList
            className={cn(
              `grid w-full ${
                currentUser?.private! ? "grid-cols-3" : "grid-cols-2"
              }`
            )}>
            <TabsTrigger value="followers">
              Followers
              <span className="font-normal text-sm ml-1 text-muted-foreground hidden sm:block">
                {" "}
                ({currentUser.followers?.total!})
              </span>
            </TabsTrigger>
            <TabsTrigger value="following">
              Following{" "}
              <span className="font-normal text-sm ml-1 text-muted-foreground hidden sm:block">
                ({currentUser.followings?.total!})
              </span>
            </TabsTrigger>
            {currentUser!.private! && (
              <TabsTrigger value="requests">
                Requests{" "}
                <span className="font-normal text-sm ml-1 text-muted-foreground hidden sm:block">
                  ({currentUser.requests?.total!})
                </span>
              </TabsTrigger>
            )}
          </TabsList>
          <div className="mt-1 relative">
            <Input
              type="text"
              placeholder={`Search ${activeTab}`}
              value={searchQuery}
              disabled={
                (activeTab === "followers" &&
                  currentUser.followers.total <= 0) ||
                (activeTab === "following" &&
                  currentUser.followings.total <= 0) ||
                (activeTab === "requests" && currentUser?.requests?.total! <= 0)
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
            <FollowerList users={filteredFollowers!} client={client} />
          </TabsContent>
          <TabsContent value="following">
            <FollowingList
              users={filteredFollowing!}
              currentUser={currentUser}
              client={client}
            />
          </TabsContent>
          <TabsContent value="requests">
            <div className="mt-4 space-y-2">
              {filteredRequests!.length > 0 ? (
                filteredRequests!.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-row items-center justify-between py-1">
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
                        <p className="text-sm text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-center gap-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={loading}>
                            Reject request
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="m-2">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <span className="font-semibold">
                                {user.name}&apos;s
                              </span>{" "}
                              request will be rejected!
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              disabled={loading}
                              className="rounded-full"
                              onClick={async () => {
                                await requestMutation.mutateAsync({
                                  followerId: user.id,
                                  status: "reject",
                                });
                              }}>
                              I&apos;m sure!
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="rounded-full"
                            disabled={loading}>
                            Accept request
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="m-2">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <span className="font-semibold">
                                {user.name}&apos;s
                              </span>{" "}
                              request will be accepted!
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              disabled={loading}
                              className="rounded-full"
                              onClick={async () => {
                                await requestMutation.mutateAsync({
                                  followerId: user.id,
                                  status: "accept",
                                });
                              }}>
                              I&apos;m sure!
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No users found
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function FollowerList({
  users,
  client,
}: {
  users: ReadonlyUser[];
  client: QueryClient;
}) {
  const [loading, setLoading] = useState(false);
  // Remove Follower Mutation:
  const removeFollowerMutation = useMutation({
    mutationKey: ["social-circle"],
    mutationFn: async ({ followerId }: { followerId: number }) => {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/follow-machine/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerId: followerId,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error from the backend");
      }

      return res.json();
    },

    onSuccess: () => {
      setLoading(false);
      toast({
        title: "Request operation sucessful!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Request operation unsucessful!",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      client.refetchQueries({
        queryKey: ["user"],
      });
      client.refetchQueries({
        queryKey: ["social-circle"],
      });
    },
  });

  return (
    <div className="mt-4 space-y-2">
      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.username}
            className="flex items-center justify-between py-1 ">
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

            <div className="flex items-center space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="hidden sm:block rounded-full"
                    size="sm">
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="m-2">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will remove{" "}
                      <span className="font-semibold">{user.name}</span> from
                      your followers list!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-full"
                      disabled={loading}
                      onClick={async () =>
                        await removeFollowerMutation.mutateAsync({
                          followerId: user.id,
                        })
                      }>
                      I&apos;m sure!
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Link href={`/profile/${user.username}`}>
                <Button variant={"default"} className="rounded-full" size="sm">
                  Go to Profile
                </Button>
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground">No users found</p>
      )}
    </div>
  );
}

function FollowingList({
  users,
  currentUser,
  client,
}: {
  users: ReadonlyUser[];
  currentUser: User;
  client: QueryClient;
}) {
  const [loading, setLoading] = useState(false);

  // Unfollow Mutation:
  const unfollowMutation = useMutation({
    mutationKey: ["social-circle"],
    mutationFn: async ({ followingId }: { followingId: number }) => {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/follow-machine/unfollow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerId: currentUser.id,
          followingId: followingId,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error from the backend");
      }

      return res.json();
    },
    onSuccess: () => {
      setLoading(false);
      toast({
        title: "Request operation sucessful!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Request operation unsucessful!",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      client.refetchQueries({
        queryKey: ["user"],
      });
      client.refetchQueries({
        queryKey: ["social-circle"],
      });
    },
  });

  return (
    <div className="mt-4 space-y-2">
      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.username}
            className="flex items-center justify-between py-1 ">
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

            <div className="flex items-center space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="hidden sm:block rounded-full"
                    size="sm">
                    Unfollow
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="m-2">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      With this action you will unfollow{" "}
                      <span className="font-semibold">{user.name}</span> from
                      your followings list!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-full"
                      disabled={loading}
                      onClick={async () => {
                        await unfollowMutation.mutateAsync({
                          followingId: user.id,
                        });
                      }}>
                      I&apos;m sure!
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Link href={`/profile/${user.username}`}>
                <Button variant={"default"} className="rounded-full" size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground">No users found</p>
      )}
    </div>
  );
}
