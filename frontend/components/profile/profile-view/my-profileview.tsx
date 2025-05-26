"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LinkIcon,
  Grid,
  Bookmark,
  LockKeyhole,
  LockKeyholeOpen,
  Flower2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import ProfileSkeleton from "@/components/skeleton/skeleton-profile";
import Image from "next/image";
import Link from "next/link";
import { FRONTEND_URL, MEDIA_URL, SERVER_URL } from "@/lib/server";
import PostFeedViewComponent from "./profile-feed/post-view";
import MySocialCircle from "./actions/my/social-circle";
import { TooltipProvider } from "@/components/ui/tooltip";
import FavouritesView from "./profile-feed/favourite-view";
import { Button } from "@/components/ui/button";
import { InteractiveCopyButton } from "./actions/my/copy-link";
import { motion } from "motion/react"; // Changed to "motion/react" as requested

type Props = {
  currentUser: User | null;
};

export default function MyProfileView({ currentUser }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "posts";
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

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
      if (e.key === "Escape") closeModal();
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

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading || !currentUser) return <ProfileSkeleton />;

  const centerX = windowSize.width / 2;
  const centerY = windowSize.height / 2;
  const gasGiantInitialX = windowSize.width * 0.82;
  const gasGiantInitialY = windowSize.height * 0.25;
  const rockyPlanetInitialX = windowSize.width * 0.15;
  const rockyPlanetInitialY = windowSize.height * 0.8;

  return (
    <main className="w-full max-w-4xl mx-auto p-1 md:p-2">
      {currentUser && isAuthenticated && (
        <>
          {/* Cover Photo */}
          {currentUser?.coverImage ? (
            <div className="h-48 rounded-md relative overflow-hidden">
              <Image
                src={`${SERVER_URL}${currentUser?.coverImage}`}
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
          <div className="px-3 relative z-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-between">
              <Avatar className="size-32 -mt-16 sm:size-38 border-4 border-background hover:cursor-pointer rounded-full bg-gray-50">
                <AvatarImage
                  src={`${SERVER_URL}${currentUser?.avatar}`}
                  alt={currentUser?.name!}
                  className="object-cover"
                  draggable="false"
                  onClick={() => openModal(currentUser!.avatar!)}
                />
                <AvatarFallback className="font-bold text-lg md:text-2xl">
                  {currentUser?.name?.at(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex sm:hidden flex-col items-center justify-center space-y-0 mb-1">
                <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
                <div className="flex flex-row items-center space-x-1">
                  <p className="text-muted-foreground">
                    @{currentUser?.username || "robot"}
                  </p>
                  <span className="font-bold">·</span>
                  {currentUser.private ? (
                    <LockKeyhole className="w-4 h-4 dark:text-yellow-100 text-yellow-900" />
                  ) : (
                    <LockKeyholeOpen className="w-4 h-4 dark:text-yellow-100 text-yellow-900" />
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-2">
                <Button variant="outline" className="rounded-full" asChild>
                  <Link href="/settings/profile">Edit profile</Link>
                </Button>
                <TooltipProvider>
                  <MySocialCircle currentUser={currentUser!} />
                  <InteractiveCopyButton
                    textToCopy={`${FRONTEND_URL}/profile/${currentUser?.username!}`}
                  />
                </TooltipProvider>
              </div>
            </div>

            <div className="mt-4">
              <div className="hidden sm:flex flex-col items-start justify-center space-y-0 mb-1">
                <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
                <div className="flex flex-row items-center space-x-2">
                  <p className="text-muted-foreground">
                    (@{currentUser?.username || "robot"})
                  </p>
                  <span className="font-bold">·</span>
                  {currentUser.private ? (
                    <LockKeyhole className="w-4 h-4" />
                  ) : (
                    <LockKeyholeOpen className="w-4 h-4" />
                  )}
                </div>
              </div>
              <div className="mt-2">
                <div className="flex flex-col items-start justify-center space-y-1 mb-2">
                  <h1 className="font-semibold">Biography</h1>
                  {currentUser?.bio ? (
                    <p className="mb-1 text-gray-600 text-sm max-w-xs overflow-hidden break-words whitespace-pre-wrap">
                      {currentUser?.bio.length > 300
                        ? currentUser?.bio.slice(0, 300) + "..."
                        : currentUser?.bio}
                    </p>
                  ) : (
                    <p className="mb-1 text-gray-600 text-sm max-w-xs overflow-hidden break-words whitespace-pre-wrap">
                      You haven't set a bio yet.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start justify-center space-y-0 mb-2">
                <h1 className="font-semibold">Link</h1>
                {currentUser.link ? (
                  <div className="flex flex-row items-center">
                    <Link
                      href={currentUser.link}
                      target="_blank"
                      className="flex flex-row text-blue-400 hover:text-blue-700 items-center hover:underline underline-offset-2">
                      <LinkIcon className="w-3 h-3 text-blue-700 mr-2" />
                      {currentUser.link}
                    </Link>
                  </div>
                ) : (
                  <p className="mb-1 text-gray-600 text-sm max-w-xs overflow-hidden break-words whitespace-pre-wrap">
                    No links provided yet!
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Tabs and Content */}
          <Tabs defaultValue={activeTab} className="mt-2 px-2 pb-16">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">
                <Grid className="h-4 w-4 mr-2" /> Posts
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Bookmark className="h-4 w-4 mr-2" /> Favorites
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4">
              <PostFeedViewComponent currentUser={currentUser!} />
            </TabsContent>
            <TabsContent value="favorites" className="mt-4">
              <FavouritesView />
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
