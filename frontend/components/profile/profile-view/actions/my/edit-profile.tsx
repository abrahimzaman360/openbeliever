"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { SERVER_URL } from "@/lib/server";
import { useAuth } from "@/lib/providers/auth-provider";
import { toast } from "sonner";
import UploadAvatar from "./upload-avatar";
import { Smile } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => <div className="p-1">Loading...</div>,
});

// Custom debounce hook for username availability check
function useDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name must be at least 3 characters.",
  }),
  username: z.string().min(1, {
    message: "Username must be at least 2 characters.",
  }),
  bio: z.string().optional(),
  link: z
    .string()
    .refine(
      (value) => {
        if (value === "") return true;
        try {
          const url = new URL(value);
          // Check for valid protocol and TLD
          return (
            (url.protocol === "http:" || url.protocol === "https:") &&
            url.hostname.includes(".") &&
            url.hostname.split(".").slice(-1)[0].length >= 2
          );
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL (e.g., https://example.com)" }
    )
    .optional(),
  private: z.boolean(),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

export default function EditProfile() {
  const { user, invalidateUser } = useAuth();
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  // default values:
  const initialValues = useMemo<FormValues>(
    () => ({
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      link: user?.link || "",
      private: user?.private || false,
    }),
    [user]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  // Watch all form fields
  const watchedFields = form.watch();

  // Check for changes whenever form values update
  useEffect(() => {
    const hasChanges = Object.keys(initialValues).some(
      (key) =>
        initialValues[key as keyof FormValues] !==
        watchedFields[key as keyof FormValues]
    );
    setHasFormChanges(hasChanges);
  }, [watchedFields, initialValues]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === user?.username) {
      setUsernameAvailable(true);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const res = await fetch(
        SERVER_URL + "/api/account/username-availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username }),
        }
      );

      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Username check failed:", error);
      setUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const debouncedCheck = useDebounce(checkUsernameAvailability, 500);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "username" && value.username) {
        debouncedCheck(value.username);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedCheck]);

  // Add the new useEffect here
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        link: user.link || "",
        private: user.private || false,
      });
    }
  }, [user, form]);

  // update mutation:
  const editMutation = useMutation({
    mutationKey: ["edit-profile"],
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch(SERVER_URL + "/api/account/update-account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Username not available", {
            description: "Please choose a different username",
            icon: "🚫",
          });
          throw new Error("Username not available");
        }

        toast.error("Update failed", {
          description: "Please try again later",
          richColors: true,
          icon: "🤔",
        });
        throw new Error("Profile update failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!", {
        richColors: false,
        icon: "🎉",
        description: "Your profile has been updated successfully.",
      });
      setLoading(false);
      form.reset({
        name: user?.name || "",
        username: user?.username || "",
        bio: user?.bio || "",
        link: user?.link || "",
        private: user?.private || false,
      });
      setIsDialogOpen(false); // Close dialog on success
      setShowConfirmDialog(false); // Close confirm dialog on success
      setTimeout(() => {
        invalidateUser();
        router.refresh();
      }, 1000);
    },
    onError: () => {
      toast.error("Something went wrong!", {
        richColors: false,
        icon: "🤔",
        description: "Please try again later.",
      });
      setLoading(false);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!usernameAvailable) {
      toast.error("Username not available!", {
        description: "Please choose a different username.",
      });
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await editMutation.mutateAsync(values);
  }

  return (
    <>
      <Dialog
        open={isDialogOpen}
        defaultOpen={false}
        onOpenChange={(open) => {
          if (!open && hasFormChanges) {
            setShowConfirmDialog(true);
            return;
          }
          setIsDialogOpen(open);
          setShowConfirmDialog(false);
          if (!open) {
            form.reset(initialValues);
            setUsernameAvailable(true);
            setIsCheckingUsername(false);
            setLoading(false);
            setHasFormChanges(false);
          }
        }}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full shadow-sm border border-gray-300 hover:bg-muted">
            Edit profile
          </Button>
        </DialogTrigger>
        <DialogContent
          className="w-full max-w-[430px] lg:max-w-xl pt-0 rounded-sm"
          onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="hidden">Edit Profile</DialogTitle>
            <DialogDescription className="hidden">
              Here you can edit your profile
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 sm:space-y-3"
              autoFocus={false}>
              <UploadAvatar />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1 mb-2">
                    <FormLabel className="flex flex-row items-center justify-start gap-x-2">
                      Username
                      {isCheckingUsername && (
                        <span className="text-sm text-gray-500">
                          (checking...)
                        </span>
                      )}
                      {!isCheckingUsername && !usernameAvailable && (
                        <span className="text-sm text-red-500">
                          (not available)
                        </span>
                      )}
                      {!isCheckingUsername &&
                        usernameAvailable &&
                        field.value !== user?.username && (
                          <span className="text-sm text-green-500">
                            (available)
                          </span>
                        )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your username"
                        {...field}
                        value={field.value.toLowerCase()}
                        onChange={(e) =>
                          field.onChange(e.target.value.toLowerCase())
                        }
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="space-y-1 mb-2">
                    <FormLabel>
                      Bio{" "}
                      <span className="text-sm font-normal text-gray-500">
                        (optional, max 300 characters)
                      </span>
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          placeholder="Write something about yourself (max 200 characters long)"
                          className="h-20 resize-none pr-10"
                          maxLength={300}
                          rows={4}
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-2 right-2 h-8 w-8">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="p-0"
                          side="right"
                          align="end">
                          <EmojiPicker
                            lazyLoadEmojis={true}
                            skinTonesDisabled={true}
                            onEmojiClick={(emojiData) => {
                              const textarea = document.querySelector(
                                'textarea[name="bio"]'
                              ) as HTMLTextAreaElement;
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = textarea.value;
                                const before = text.substring(0, start);
                                const after = text.substring(end, text.length);
                                field.onChange(
                                  before + emojiData.emoji + after
                                );
                                textarea.focus();
                                setTimeout(() => {
                                  textarea.selectionStart =
                                    textarea.selectionEnd =
                                      start + emojiData.emoji.length;
                                }, 0);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem className="space-y-1 mb-2">
                    <FormLabel>
                      Link{" "}
                      <span className="text-sm font-normal text-gray-500">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        disabled={loading}
                        className={cn(
                          "focus-visible:ring-offset-2",
                          form.formState.errors.link &&
                            "border-destructive ring-destructive focus-visible:ring-destructive"
                        )}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          field.onChange(value);
                          if (value === "") {
                            form.clearErrors("link");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="private"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 md:p-4">
                    <div className="flex flex-col justify-center min-h-[2rem]">
                      <FormLabel className="text-base">
                        Private Account
                      </FormLabel>
                      <FormDescription>
                        When enabled, only approved followers can see your
                        stories
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full rounded-full"
                  disabled={
                    !form.formState.isValid ||
                    !usernameAvailable ||
                    isCheckingUsername ||
                    !hasFormChanges ||
                    form.formState.isSubmitting ||
                    !!form.formState.errors.link
                  }>
                  {loading ? "Saving changes..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                setShowConfirmDialog(false);
                setIsDialogOpen(false);
                form.reset(initialValues);
              }}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
