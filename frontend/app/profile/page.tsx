"use client";
import MyProfileClientView from "@/components/profile/profile-view/my-profileview";
import ProfileSkeleton from "@/components/skeleton/skeleton-profile";
import { SERVER_URL } from "@/lib/server";
import { useQuery } from "@tanstack/react-query";

export default function ProfilePage() {
  const {
    data: currentUser,
    isLoading,
    isError,
  } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/account/me`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <ProfileSkeleton />;
  if (isError) return <div>Error</div>;
  return <MyProfileClientView currentUser={currentUser!} />;
}
