import { Skeleton } from "../ui/skeleton";

export default function FeedMenuSkeleton({ className }: { className: string }) {
  return (
    <>
      <div
        className={
          "sticky top-0 h-screen p-4 hidden lg:block border-x border-border max-w-xs w-full"
        }>
        <div className="flex h-full flex-col">
          {/* Logo Skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Navigation Skeleton */}
          <div className="flex flex-col space-y-4 mt-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 py-1">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>

          {/* Create Post Skeleton */}
          <Skeleton className="h-12 w-full mt-6 rounded-full" />

          {/* Profile Section Skeleton */}
          <div className="mt-auto flex items-center space-x-3 rounded-full p-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 h-screen p-2 hidden sm:block lg:hidden max-w-sm w-full">
        <div className="flex h-full flex-col items-center space-y-6">
          <Skeleton className="h-8 w-8 rounded-full" />

          <div className="flex flex-col items-center space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-10 rounded-full" />
            ))}
          </div>

          <Skeleton className="h-10 w-10 rounded-full mt-auto mb-4" />
        </div>
      </div>

      {/* Mobile bottom navigation skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t sm:hidden">
        <div className="flex justify-around items-center h-16">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-3 w-12 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
