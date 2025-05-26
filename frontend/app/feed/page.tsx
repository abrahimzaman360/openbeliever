"use client";
import { ThinkTankPost } from "@/components/feed/feed-post-view";
import { useAuth } from "@/lib/providers/auth-provider";
import { SERVER_URL } from "@/lib/server";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostSkeleton } from "@/components/skeleton/post-skeleton";
import { useInView } from "react-intersection-observer"; // ✅ Import Hook
import { LoaderCircle } from "lucide-react";

// Types
type PostResponse = {
  data: Post[];
  meta: {
    currentPage: number;
    lastPage: number;
  };
};

export default function Index() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(false); // Local state for showing loader before fetch

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<PostResponse, Error>({
    queryKey: ["discover", currentPage],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(
        `${SERVER_URL}/api/post-machine/posts?page=${pageParam}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch posts.");
      return res.json();
    },
    enabled: !!user,
    initialPageParam: currentPage,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
  });

  // Intersection Observer inside the ScrollArea
  const { ref, inView } = useInView({
    root: scrollRef.current, // Observe within the ScrollArea
    threshold: 0.1, // Trigger when 10% of the element is visible
    triggerOnce: false,
  });

  if (inView && hasNextPage && !isFetchingNextPage && !isFetching) {
    setIsFetching(true);
    fetchNextPage().finally(() => setIsFetching(false));
  }

  const posts = data?.pages?.flatMap((page) => page.data) || [];

  return (
    <>
      {/* Show skeleton loader on initial load */}
      {isLoading ? (
        <PostSkeleton />
      ) : posts.length > 0 ? (
        <>
          <div className="relative scroll-hint">
            <ScrollArea
              ref={scrollRef}
              className="w-full h-[calc(100vh-100px)] overflow-y-auto">
              <div className="flex flex-col items-center gap-y-3 gap-x-2 p-4">
                {posts.map((post) => (
                  <ThinkTankPost key={post.id} post={post} />
                ))}
              </div>
              {/* Infinite Scroll Loader/Error Handler */}
              <div ref={ref} className="flex justify-center items-center h-20">
                {isFetchingNextPage && (
                  <LoaderCircle className="animate-spin" />
                )}
                {isError && (
                  <p className="text-red-500">
                    Error: {error?.message || "Failed to fetch posts."}
                  </p>
                )}
                {!hasNextPage && (
                  <p className="text-muted-foreground">
                    No more posts to load.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      ) : (
        <p className="text-center text-muted-foreground p-4">No posts found.</p>
      )}
    </>
  );
}
