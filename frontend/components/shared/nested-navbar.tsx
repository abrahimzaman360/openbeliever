"use client";
import { Skeleton } from "@/components/ui/skeleton";
import SearchUsers from "./search-user";
import { useAuth } from "@/lib/providers/auth-provider";

export function SearchBarSkeleton() {
  return (
    <div className="w-full max-w-xl mx-auto mt-2">
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
}

export default function NestedNavbar() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SearchBarSkeleton />;
  }

  return (
    <div className="py-2 border-b-2 shain flex items-center justify-center w-full mx-auto sm:px-0 px-2">
      {isAuthenticated && !isLoading && (
        <SearchUsers classes="sticky top-0 z-50" />
      )}
    </div>
  );
}
