"use client";
import { SERVER_URL } from "@/lib/server";
import OthersProfileView from "@/components/profile/profile-view/others-profileview";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import ProfileSkeleton from "@/components/skeleton/skeleton-profile";
import Link from "next/link";

// Define a custom error type
interface ApiError extends Error {
  status?: number;
  response?: {
    status: number;
    data: any;
  };
}

export default function PublicProfilePage() {
  const { username } = useParams();
  const {
    data: requestedUser,
    isLoading,
    isError,
    error,
  } = useQuery<User>({
    queryKey: ["requested-user", username],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/users/${username}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorObj = new Error("API Error") as ApiError;
        errorObj.status = res.status;
        throw errorObj;
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const apiErr = error as ApiError;

  if (isLoading && !isError && !requestedUser) return <ProfileSkeleton />;

  // Check if error is 404
  if (isError && apiErr.status === 404)
    return (
      <section className="h-[50vh]	 flex  items-center justify-center">
        <div className="px-4 mx-auto max-w-screen-2xl flex flex-col items-center justify-center lg:px-6">
          <div className="mx-auto max-w-screen-sm text-center">
            <h1 className="mb-4 text-6xl tracking-tight font-extrabold">404</h1>
            <p className="mb-4 text-xl tracking-tight text-muted-foreground">
              User you&apos;re looking for does not exist.
            </p>
          </div>
          <Link
            href={"/feed"}
            className="w-auto bg-primary px-5 py-3 text-sm font-medium text-center text-white rounded-full hover:shadow-md hover:border hover:border-secondary border hover:bg-primary-dark">
            Return to Home
          </Link>
        </div>
      </section>
    );
  if (isError) return <div>Failed to fetch user data;</div>;

  return <OthersProfileView requestedUser={requestedUser!} />;
}
