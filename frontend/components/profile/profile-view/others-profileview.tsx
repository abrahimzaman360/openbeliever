"use client";
import {
  Ban,
  Bookmark,
  Copy,
  Flag,
  Grid,
  LinkIcon,
  MoreHorizontal,
  Lock,
  Loader2,
  ImageIcon,
  Flower2,
  Camera,
  FlowerIcon,
  Flower2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FRONTEND_URL, MEDIA_URL, SERVER_URL } from "@/lib/server";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FollowPrivateButton from "./actions/others/follow-private-account";
import PublicFollowButton from "./actions/others/follow-public-account";
import OthersSocialCircle from "./actions/others/social-circle";
import AccountStatus from "./actions/others/account-status";
import { motion } from "motion/react";
import ProfileSkeleton from "@/components/skeleton/skeleton-profile";

interface PublicClientViewProps {
  requestedUser: User;
}

export default function OthersProfileView({
  requestedUser,
}: PublicClientViewProps) {
  const { username } = useParams();
  const navigate = useRouter();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!username || username === user?.username) {
      navigate.push("/profile");
    }
  }, [username, user, navigate]);

  const openModal = (image: string) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage("");
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      } else {
        e.preventDefault();
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("no-scroll");
    };
  }, [isModalOpen]);

  // Check user following list and whether the requested user is being followed
  useEffect(() => {
    if (user?.followings?.list && user) {
      const isCurrentlyFollowing = user.followings.list.some(
        (follower: { username: string }) =>
          follower.username === requestedUser.username
      );
      setIsFollowing(isCurrentlyFollowing);
      setIsLoading(false); // Done loading
    } else {
      setIsLoading(false); // Done loading
    }
  }, [requestedUser, user]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const centerX = windowSize.width / 2;
  const centerY = windowSize.height / 2;
  const gasGiantInitialX = windowSize.width * 0.82;
  const gasGiantInitialY = windowSize.height * 0.25;
  const rockyPlanetInitialX = windowSize.width * 0.15;
  const rockyPlanetInitialY = windowSize.height * 0.8;

  if (
    isLoading ||
    !requestedUser ||
    requestedUser.username === user?.username
  ) {
    return <ProfileSkeleton />;
  }

  return (
    <main className="w-full max-w-4xl mx-auto p-2">
      {requestedUser && (
        <>
          {/* Cover Photo */}
          {requestedUser?.coverImage ? (
            <div className={"h-48 rounded-md relative overflow-hidden"}>
              <Image
                src={`${SERVER_URL}${requestedUser?.coverImage}`}
                alt="Cover Photo"
                width={1024}
                height={48}
                className="object-cover w-full h-48"
                draggable="false"
              />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-gradient-to-r rounded-md from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
              <div className="text-center flex flex-row items-center justify-around gap-2">
                <Flower2 className="w-16 h-16" />
                <h1 className="font-medium text-xl text-muted-foreground">
                  No Cover Photo
                </h1>
              </div>
            </div>
          )}

          {/* Profile Info */}
          <div className="px-3 -mt-16 relative z-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-between">
              <Avatar className="size-32 sm:size-38 border-4 border-background hover:cursor-pointer rounded-full bg-gray-50">
                <AvatarImage
                  src={`${SERVER_URL}${requestedUser?.avatar}`}
                  alt={requestedUser?.name!}
                  className="object-cover"
                  draggable="false"
                  onClick={() => openModal(requestedUser!.avatar!)}
                />
                <AvatarFallback className="font-bold text-lg md:text-2xl">
                  {requestedUser?.name?.at(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 sm:mt-0 flex space-x-2">
                {isLoading ? (
                  <Button disabled className="rounded-full animate-pulse">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </Button>
                ) : requestedUser!.private ? (
                  <FollowPrivateButton
                    currentUser={user!}
                    requestedUser={requestedUser!}
                  />
                ) : (
                  <PublicFollowButton
                    currentUser={user!}
                    requestedUser={requestedUser!}
                    isFollowing={isFollowing}
                    onFollowChange={(newState) => setIsFollowing(newState)}
                  />
                )}

                {!isLoading && isFollowing && (
                  <OthersSocialCircle
                    beingStalked={requestedUser!}
                    disabled={isLoading}
                  />
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${FRONTEND_URL}/profile/${requestedUser?.username}`
                        );
                        toast.success("Copied to clipboard", {
                          description: "Proifle link copied to clipboard",
                          richColors: false,
                          icon: "🎉",
                          duration: 1000,
                        });
                      }}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy profile link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      disabled>
                      <Ban className="mr-2 h-4 w-4" />
                      Block user
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      disabled>
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex flex-col items-start justify-center mb-1">
                <h1 className="text-2xl font-bold">{requestedUser?.name}</h1>
                <div className="flex flex-row items-center space-x-2">
                  <p className="text-muted-foreground">
                    (@{requestedUser?.username || "robot"})
                  </p>
                  <span className="font-bold">·</span>
                  <AccountStatus user={requestedUser!} />
                </div>
              </div>
              <div>
                {requestedUser?.bio && (
                  <div className="flex flex-col items-start justify-center space-y-1 mb-2">
                    <h1 className="font-semibold">Biography</h1>
                    <p className="mb-2 text-gray-600 text-sm max-w-xs overflow-hidden break-words">
                      {requestedUser?.bio.length > 200
                        ? requestedUser?.bio.slice(0, 200) + "..."
                        : requestedUser?.bio}
                    </p>
                  </div>
                )}
              </div>
              {requestedUser.link && (
                <div className="flex flex-col items-start justify-center space-y-0 mb-2">
                  <h1 className="font-semibold">Link</h1>
                  <div className="flex flex-row items-center">
                    <Link
                      href={requestedUser.link}
                      target="_blank"
                      className="flex flex-row text-blue-400 hover:text-blue-600 items-center hover:underline hover:underline-offset-2">
                      <LinkIcon className="w-3 h-3 text-blue-600 mr-2" />
                      {requestedUser.link}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs and Content */}
          <Tabs defaultValue="posts" className="mt-4 px-2 pb-16">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">
                <Grid className="h-4 w-4 mr-2" /> Posts
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Bookmark className="h-4 w-4 mr-2" /> Favorites
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4">
              {requestedUser!.private && !isFollowing && (
                <div className="flex flex-col items-center justify-center mx-auto mt-10">
                  <div className="flex flex-col items-center space-y-2">
                    <Lock className="size-10 sm:size-14" />
                    <h1 className="text-lg font-bold">Private Account</h1>
                  </div>

                  <p className="text-md text-muted-foreground text-center">
                    Follow to see their posts.
                  </p>
                </div>
              )}
              {requestedUser!.private &&
                isFollowing &&
                requestedUser!.posts.total > 0 && (
                  <div className="flex flex-col items-center justify-center mx-auto mt-10">
                    <div className="flex flex-col items-center space-y-1 text-center">
                      <Flower2 className="size-10 sm:size-14" />
                      <h1 className="font-bold text-lg">Bringing Life Soon!</h1>
                      <p className="text-muted-foreground">
                        This feature will be soon available!
                      </p>
                    </div>
                  </div>
                )}
              {!requestedUser!.private &&
                isFollowing &&
                requestedUser!.posts.total <= 0 && (
                  <div className="flex flex-col items-center justify-center mx-auto mt-10">
                    <div className="flex flex-col items-center space-y-2">
                      <ImageIcon className="size-10 sm:size-14" />
                      <h1 className="text-lg font-bold">No posts yet</h1>
                    </div>
                    <p className="text-md text-muted-foreground text-center">
                      When they post something, it will show up here.
                    </p>
                  </div>
                )}
              {!requestedUser!.private &&
                !isFollowing &&
                requestedUser!.posts.total <= 0 && (
                  <div className="flex flex-col items-center justify-center mx-auto mt-10">
                    <div className="flex flex-col items-center space-y-2">
                      <ImageIcon className="size-10 sm:size-14" />
                      <h1 className="text-lg font-bold">No posts yet</h1>
                    </div>
                    <p className="text-md text-muted-foreground text-center">
                      When they post something, it will show up here.
                    </p>
                  </div>
                )}
            </TabsContent>
            <TabsContent value="favorites" className="mt-4">
              {requestedUser!.private && !isFollowing && (
                <div className="flex flex-col items-center justify-center mx-auto mt-10">
                  <div className="flex flex-col items-center space-y-2">
                    <Lock className="size-10 sm:size-14" />
                    <h1 className="text-lg font-bold">Private Account</h1>
                  </div>
                  <p className="text-md text-muted-foreground text-center">
                    Follow to see their favorite posts.
                  </p>
                </div>
              )}
              {requestedUser!.private &&
                isFollowing &&
                requestedUser!.posts.total > 0 && (
                  <div className="flex flex-col items-center justify-center mx-auto mt-10">
                    <div className="flex flex-col items-center space-y-1 text-center">
                      <Flower2 className="size-10 sm:size-14" />
                      <h1 className="font-bold text-lg">Bringing Life Soon!</h1>
                      <p className="text-muted-foreground">
                        This feature will be soon available! (Show)
                      </p>
                    </div>
                  </div>
                )}
              {!requestedUser!.private &&
                isFollowing &&
                requestedUser!.posts.total <= 0 && (
                  <div className="flex flex-col items-center justify-center mx-auto mt-10">
                    <div className="flex flex-col items-center space-y-2">
                      <Flower2Icon className="size-10 sm:size-14" />
                      <h1 className="text-lg font-bold">No favourites yet</h1>
                    </div>
                    <p className="text-md text-muted-foreground text-center">
                      When they will save a post as favorite, it will show up
                      here.
                    </p>
                  </div>
                )}
              {!requestedUser!.private &&
                !isFollowing &&
                requestedUser!.posts.total <= 0 && (
                  <div className="flex flex-col items-center justify-center mx-auto mt-10">
                    <div className="flex flex-col items-center space-y-2">
                      <Flower2Icon className="size-10 sm:size-14" />
                      <h1 className="text-lg font-bold">No favourites yet</h1>
                    </div>
                    <p className="text-md text-muted-foreground text-center">
                      When they will save a post as favorite, it will show up
                      here.
                    </p>
                  </div>
                )}
            </TabsContent>
          </Tabs>

          {isModalOpen && (
            <div
              className="fixed inset-0 z-50 flex select-none overflow-hidden items-center justify-center bg-black bg-opacity-90 backdrop-blur-md"
              onClick={closeModal}
              role="dialog"
              aria-modal="true">
              <div className="relative flex flex-col items-center justify-center w-full h-full">
                {/* Stars */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 150 }).map((_, i) => {
                    const size = Math.random() * 2 + 1;
                    const initialLeft = `${Math.random() * 100}%`;
                    const initialTop = `${Math.random() * 100}%`;

                    return (
                      <motion.div
                        key={`star-${i}`}
                        className="absolute rounded-full"
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          backgroundColor: ["#ffffff", "#fffaf0", "#f0f8ff"][
                            Math.floor(Math.random() * 3)
                          ],
                          opacity: Math.random() * 0.7 + 0.3,
                          left: initialLeft,
                          top: initialTop,
                        }}
                        animate={{
                          left: i % 3 === 0 ? `${50}%` : initialLeft,
                          top: i % 3 === 0 ? `${50}%` : initialTop,
                          opacity: i % 3 === 0 ? [0.7, 0] : [0.7, 0.3, 0.7],
                          scale: i % 3 === 0 ? [1, 0] : [1, 1.2, 1],
                        }}
                        transition={{
                          duration: i % 3 === 0 ? 8 + Math.random() * 12 : 20,
                          repeat: Infinity,
                          delay: Math.random() * 5,
                          repeatType: i % 3 === 0 ? "loop" : "reverse",
                          ease: i % 3 === 0 ? "easeIn" : "easeInOut",
                        }}
                      />
                    );
                  })}
                </div>

                {/* Planets */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div
                    className="absolute rounded-full bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-800"
                    style={{
                      width: "140px",
                      height: "140px",
                      left: gasGiantInitialX,
                      top: gasGiantInitialY,
                      boxShadow: "inset 10px -10px 20px rgba(0,0,0,0.4)",
                      zIndex: 3,
                    }}
                    animate={{
                      x: centerX - gasGiantInitialX,
                      y: centerY - gasGiantInitialY,
                      scale: [1, 0.8, 0],
                      opacity: [1, 0.8, 0],
                    }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      repeatDelay: 15,
                      ease: "easeIn",
                      times: [0, 0.7, 1],
                    }}>
                    <motion.div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 border border-purple-300/30 rounded-full -rotate-12"
                      animate={{
                        scaleX: [1, 0.8, 0.2],
                        scaleY: [1, 1.2, 0.3],
                        opacity: [0.3, 0.2, 0],
                      }}
                      transition={{
                        duration: 25,
                        repeat: Infinity,
                        repeatDelay: 15,
                        ease: "easeIn",
                        times: [0, 0.7, 1],
                      }}
                    />
                    <motion.div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-14 border border-purple-200/20 rounded-full -rotate-12"
                      animate={{
                        scaleX: [1, 0.7, 0.1],
                        scaleY: [1, 1.1, 0.2],
                        opacity: [0.2, 0.15, 0],
                      }}
                      transition={{
                        duration: 25,
                        repeat: Infinity,
                        repeatDelay: 15,
                        ease: "easeIn",
                        times: [0, 0.7, 1],
                      }}
                    />
                  </motion.div>

                  <motion.div
                    className="absolute rounded-full bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800"
                    style={{
                      width: "60px",
                      height: "60px",
                      left: rockyPlanetInitialX,
                      top: rockyPlanetInitialY,
                      boxShadow: "inset 5px -5px 15px rgba(0,0,0,0.5)",
                      zIndex: 4,
                    }}
                    animate={{
                      x: centerX - rockyPlanetInitialX,
                      y: centerY - rockyPlanetInitialY,
                      scale: [1, 0.7, 0],
                      opacity: [1, 0.7, 0],
                    }}
                    transition={{
                      duration: 18,
                      repeat: Infinity,
                      repeatDelay: 20,
                      ease: "easeIn",
                      times: [0, 0.7, 1],
                    }}
                  />
                </div>

                {/* Accretion Disk */}
                <motion.div
                  className="absolute w-full h-full pointer-events-none z-10"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear",
                  }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={`wave-ring-${i}`}
                      className="absolute rounded-full border"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: `${(i + 4) * 90}px`,
                        height: `${(i + 4) * 80}px`,
                        borderColor: `rgba(100, 181, 246, ${0.15 - i * 0.02})`,
                        borderWidth: `${2 - i * 0.3}px`,
                      }}
                      animate={{
                        scaleX: [1, 1.05, 0.95, 1],
                        scaleY: [1, 0.95, 1.05, 1],
                        opacity: [0.7, 0.4, 0.5, 0.7],
                      }}
                      transition={{
                        duration: 12 + i * 2,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: i * 0.8,
                      }}
                    />
                  ))}
                </motion.div>

                {/* Matter Streams */}
                <div className="absolute inset-0 pointer-events-none z-5">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    const startDistance =
                      Math.max(windowSize.width, windowSize.height) * 0.4;
                    const startX = Math.cos(angle) * startDistance + centerX;
                    const startY = Math.sin(angle) * startDistance + centerY;

                    return (
                      <motion.div
                        key={`matter-stream-${i}`}
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: "100%",
                          height: "100%",
                          zIndex: 6,
                          opacity: 0,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.15, duration: 0.1 }}>
                        <motion.div
                          style={{
                            position: "absolute",
                            left: startX,
                            top: startY,
                            width: "3px",
                            height: `${60 + Math.random() * 40}px`,
                            background: `rgba(100,181,246,${
                              0.3 + Math.random() * 0.2
                            })`,
                            borderRadius: "4px",
                            transformOrigin: "center",
                            transform: `rotate(${angle + Math.PI}rad)`,
                          }}
                          animate={{
                            left: centerX,
                            top: centerY,
                            width: [3, 2, 0],
                            height: [60, 20, 0],
                            opacity: [0.7, 0.3, 0],
                          }}
                          transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 3,
                            ease: "easeIn",
                            times: [0, 0.7, 1],
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Dark Background */}
                <motion.div
                  className="absolute inset-0 pointer-events-none opacity-70 z-3"
                  animate={{ scale: [1, 1.02, 0.98, 1] }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }}>
                  <div className="absolute w-full h-full bg-gradient-radial from-transparent via-black/80 to-black" />
                  <div className="absolute left-1/4 top-1/3 w-96 h-96 rounded-full bg-gradient-radial from-blue-900/10 to-transparent blur-3xl" />
                  <div className="absolute right-1/4 bottom-1/3 w-80 h-80 rounded-full bg-gradient-radial from-purple-900/10 to-transparent blur-3xl" />
                </motion.div>

                {/* Black Hole Image */}
                <motion.div
                  className="relative z-20"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}>
                  <motion.div
                    className="absolute -inset-4 rounded-full pointer-events-none"
                    animate={{
                      rotate: [0, 360],
                      scaleX: [1, 1.03, 0.97, 1],
                      scaleY: [1, 0.97, 1.03, 1],
                    }}
                    transition={{
                      rotate: {
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                      },
                      scale: {
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                      },
                    }}>
                    <div className="w-full h-full bg-gradient-conic from-blue-900/10 via-blue-500/5 to-purple-800/5 rounded-full blur-sm" />
                  </motion.div>

                  <div className="w-72 h-72 rounded-full overflow-hidden relative">
                    <motion.div
                      className="absolute inset-0 bg-gradient-radial from-black/70 to-black/90 z-10 pointer-events-none"
                      animate={{
                        opacity: [0.6, 0.8, 0.6],
                        scaleX: [1, 1.05, 0.95, 1],
                        scaleY: [1, 0.95, 1.05, 1],
                      }}
                      transition={{
                        opacity: {
                          duration: 6,
                          repeat: Infinity,
                          repeatType: "mirror",
                          ease: "easeInOut",
                        },
                        scale: {
                          duration: 8,
                          repeat: Infinity,
                          repeatType: "mirror",
                          ease: "easeInOut",
                        },
                      }}
                    />
                    <Image
                      src={`${SERVER_URL}${selectedImage}`}
                      alt="Display Image Preview"
                      width={300}
                      height={300}
                      quality={100}
                      blurDataURL={`${MEDIA_URL}${selectedImage}`}
                      className="object-cover"
                      draggable="false"
                      unoptimized
                      priority
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
