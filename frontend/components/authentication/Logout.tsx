"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/lib/providers/auth-provider";
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

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const { logout } = useAuth();

  async function handleLogout() {
    // CSR logout
    const res = await logout();
    if (!res.success) {
      toast.error("Failed to logout!", {
        description: "Please try again later.",
        icon: "🚨",
        richColors: true,
      });
      return;
    }

    // SSR logout
    await logout();
    toast.success("Logged out successfully");
    setShowDialog(false);

    setTimeout(() => {
      router.refresh();
    }, 1500);
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button variant={"ghost"} className="w-full justify-start font-normal">
          <LogOut className="h-4 w-4 mr-1 text-black" />
          Logout
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[460px] rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground text-white rounded-full hover:bg-destructive/90"
            onClick={() => {
              startTransition(async () => {
                await handleLogout();
              });
            }}
            disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "I'm sure"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
