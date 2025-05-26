import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <main className="w-full max-w-4xl mx-auto p-2">
      {/* Cover Photo Skeleton */}
      <Skeleton className="h-48 rounded-md relative overflow-hidden" />

      {/* Profile Info Skeleton */}
      <div className="px-3 sm:px-3 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-between">
          <Skeleton className="size-32 sm:size-38 border-4 border-zinc-50 rounded-full" />
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-4 rounded-full" />
          </div>
        </div>

        <div className="mt-3">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-xs" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </div>

          <div className="mt-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-6 p-2 md:px-0">
        <div className="grid w-full grid-cols-2 gap-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
