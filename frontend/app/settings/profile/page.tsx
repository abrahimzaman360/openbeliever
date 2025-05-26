"use client";

import type React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MEDIA_URL, SERVER_URL } from "@/lib/server";
import { useAuth } from "@/lib/providers/auth-provider";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Camera,
  Check,
  Edit,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  LockKeyhole,
  LockKeyholeOpen,
  RotateCcw,
  RotateCw,
  Smile,
  Twitter,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Cropper from "react-easy-crop";
import { motion } from "motion/react";
import UploadAvatar from "@/components/profile/profile-view/actions/my/upload-avatar";
import { default as NextImage } from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter,
} from "@/components/ui/emoji-picker";

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

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
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
  socialLinks: z.object({
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const { user, invalidateUser, isLoading } = useAuth();
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isHoveringCover, setIsHoveringCover] = useState(false);

  // Cover image state
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showCoverEditor, setShowCoverEditor] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Crop state for cover image
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
  const [coverZoom, setCoverZoom] = useState(1);
  const [coverRotation, setCoverRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  // Mock statistics data
  const stats = {
    followers: user?.followers.total || 0,
    following: user?.followings.total || 0,
    posts: user?.posts.total || 0,
    likes: 0,
  };

  // default values:
  const initialValues = useMemo<FormValues>(
    () => ({
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      link: user?.link || "",
      private: user?.private || false,
      socialLinks: {
        twitter: user?.socialLinks?.twitter || "",
        facebook: user?.socialLinks?.facebook || "",
        instagram: user?.socialLinks?.instagram || "",
        linkedin: user?.socialLinks?.linkedin || "",
        github: user?.socialLinks?.github || "",
      },
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
    const hasChanges = Object.keys(initialValues).some((key) => {
      if (key === "socialLinks") {
        return Object.keys(initialValues.socialLinks).some(
          (socialKey) =>
            initialValues.socialLinks[
              socialKey as keyof typeof initialValues.socialLinks
            ] !==
            watchedFields.socialLinks[
              socialKey as keyof typeof watchedFields.socialLinks
            ]
        );
      }
      return (
        initialValues[key as keyof FormValues] !==
        watchedFields[key as keyof FormValues]
      );
    });
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
        socialLinks: {
          twitter: user?.socialLinks?.twitter || "",
          facebook: user?.socialLinks?.facebook || "",
          instagram: user?.socialLinks?.instagram || "",
          linkedin: user?.socialLinks?.linkedin || "",
          github: user?.socialLinks?.github || "",
        },
      });

      // Set cover image if available // changes
      if (user.coverImage) {
        setCoverImage(`${SERVER_URL}${user.coverImage}`);
      }
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
          richColors: false,
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
        socialLinks: {
          twitter: user?.socialLinks?.twitter || "",
          facebook: user?.socialLinks?.facebook || "",
          instagram: user?.socialLinks?.instagram || "",
          linkedin: user?.socialLinks?.linkedin || "",
          github: user?.socialLinks?.github || "",
        },
      });
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

  // Submit Function
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

  // Handle cover image selection
  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
      setShowCoverEditor(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle cover crop complete
  const onCoverCropComplete = (_: any, cropAreaPixels: CropArea) => {
    setCroppedAreaPixels(cropAreaPixels);
  };

  // Create cropped cover image
  const createCroppedCoverImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!coverImage || !croppedAreaPixels) {
        reject(new Error("No image source or crop area"));
        return;
      }

      const image = new Image();
      image.src = coverImage;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Set dimensions to match the crop area
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Apply rotation and cropping
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((coverRotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Draw the cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.restore();

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas is empty"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      };

      image.onerror = () => {
        reject(new Error("Error loading image"));
      };
    });
  };

  // Save cover image
  const saveCoverImage = async () => {
    try {
      setIsUploadingCover(true);

      const croppedImage = await createCroppedCoverImage();

      // Create form data for upload
      const formData = new FormData();
      formData.append(
        "cover",
        croppedImage,
        coverImageFile?.name || "cover.jpg"
      );

      // Upload to server
      const response = await fetch(SERVER_URL + "/api/account/upload-cover", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload cover image");
      }

      toast.success("Cover image updated successfully");
      setShowCoverEditor(false);

      // Refresh user data
      setTimeout(() => {
        invalidateUser();
        router.refresh();
      }, 1000);
    } catch (error) {
      toast.error("Failed to update cover image");
      console.error(error);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Cancel cover image edit
  const cancelCoverEdit = () => {
    setShowCoverEditor(false);
    setCoverZoom(1);
    setCoverRotation(0);
    setCoverCrop({ x: 0, y: 0 });

    // Reset to user's current cover if available
    if (user?.coverImage) {
      setCoverImage(`${SERVER_URL}${user.coverImage}`);
    } else {
      setCoverImage(null);
    }

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  // Wait for user to be available
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="container mx-auto w-full h-screen">
      <div className="space-y-6">
        {/* Cover Image Section */}
        <div className="relative rounded-b-xl overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-md">
          <div
            className={`${
              showCoverEditor ? "h-64 sm:h-80" : "h-48 sm:h-64"
            } relative overflow-hidden transition-all duration-300`}
            onMouseEnter={() => setIsHoveringCover(true)}
            onMouseLeave={() => setIsHoveringCover(false)}>
            {showCoverEditor && coverImage ? (
              <div className="absolute inset-0 bg-black">
                <Cropper
                  image={coverImage}
                  crop={coverCrop}
                  zoom={coverZoom}
                  rotation={coverRotation}
                  aspect={3}
                  onCropChange={setCoverCrop}
                  onCropComplete={onCoverCropComplete}
                  onZoomChange={setCoverZoom}
                  showGrid={true}
                  objectFit="horizontal-cover"
                />

                {/* Cover image editing controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full p-2 flex items-center gap-2 z-10">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setCoverZoom((prev) => Math.max(prev - 0.1, 1))
                    }
                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                    disabled={coverZoom <= 1}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>

                  <div className="w-24">
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={coverZoom}
                      onChange={(e) =>
                        setCoverZoom(Number.parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setCoverZoom((prev) => Math.min(prev + 0.1, 3))
                    }
                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                    disabled={coverZoom >= 3}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  <Separator
                    orientation="vertical"
                    className="h-6 bg-white/30"
                  />

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setCoverRotation((prev) => prev - 90)}
                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20">
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setCoverRotation((prev) => prev + 90)}
                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Save/Cancel buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelCoverEdit}
                    className="bg-white/90 rounded-full hover:bg-white text-black">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveCoverImage}
                    disabled={isUploadingCover}
                    className="bg-white/90 rounded-full hover:bg-white text-black">
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {coverImage || user?.coverImage! ? (
                  <NextImage
                    src={coverImage || `${SERVER_URL}${user?.coverImage}`}
                    alt="Cover Photo"
                    fill
                    className="object-cover"
                    draggable="false"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                    <div className="text-center mb-10">
                      <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center rounded-full bg-white/20 dark:bg-white/10">
                        <Camera className="h-10 w-10 text-blue-800/60 dark:text-blue-200/70" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 right-4">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleCoverImageSelect}
                    className="hidden"
                    id="cover-upload"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/80 hover:bg-white text-black rounded-full"
                    onClick={() => {
                      if (coverInputRef.current) {
                        coverInputRef.current.click();
                      }
                    }}>
                    <Camera className="h-4 w-4 mr-2" />
                    {user?.coverImage ? "Change Cover" : "Add Cover"}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Profile Info Card */}
          <div
            className={`px-0 sm:px-4 ${
              showCoverEditor
                ? "pb-6 mt-0"
                : isHoveringCover
                ? "pb-6 mt-2" // When hovering, don't use negative margin
                : "pb-6 -mt-16" // Normal state with avatar overlapping cover
            } relative z-10 transition-all duration-300 ease-in-out `}>
            <div className="bg-card rounded-md shadow-lg px-3 sm:p-6 border">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar and Stats Column */}
                <div className="md:w-1/3 flex flex-col items-center md:items-start">
                  <div className="flex flex-col items-center justify-center w-full">
                    <motion.div className="relative group -mt-18 mb-2">
                      <UploadAvatar />
                    </motion.div>

                    {/* User info */}
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                      <div className="flex flex-row items-center justify-center space-x-1">
                        <p className="text-muted-foreground">
                          @{user?.username || "robot"}
                        </p>
                        <span className="font-bold">·</span>
                        {user?.private ? (
                          <LockKeyhole className="w-4 h-4" />
                        ) : (
                          <LockKeyholeOpen className="w-4 h-4" />
                        )}
                      </div>
                      {user?.link && (
                        <a
                          href={user.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline flex items-center justify-center mt-1">
                          <Globe className="h-3 w-3 mr-1" />
                          {new URL(user.link).hostname}
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Stats */}
                  <Card className="w-full bg-card border shadow-inner border-muted-foreground/20">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Followers
                          </p>
                          <p className="text-xl font-bold">
                            {stats.followers.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Following
                          </p>
                          <p className="text-xl font-bold">
                            {stats.following.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Posts</p>
                          <p className="text-xl font-bold">
                            {stats.posts.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Likes</p>
                          <p className="text-xl font-bold">
                            {stats.likes.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Edit Profile Column */}
                <div className="md:w-2/3">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full pb-12 mb-2 sm:pb-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="profile">
                        <Edit className="w-4 h-4 mr-2" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="social">
                        <Users className="w-4 h-4 mr-2" />
                        Social Links
                      </TabsTrigger>
                    </TabsList>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                        autoFocus={false}>
                        <TabsContent value="profile" className="space-y-4 mt-4">
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
                              <FormItem className="space-y-1">
                                <FormLabel className="flex flex-row items-center justify-start gap-x-2">
                                  Username
                                  {isCheckingUsername && (
                                    <span className="text-sm text-gray-500">
                                      (checking...)
                                    </span>
                                  )}
                                  {!isCheckingUsername &&
                                    !usernameAvailable && (
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
                                      field.onChange(
                                        e.target.value.toLowerCase()
                                      )
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
                              <FormItem className="space-y-1">
                                <FormLabel>
                                  Bio{" "}
                                  <span className="text-sm font-normal text-gray-500">
                                    (optional, max 300 characters)
                                  </span>
                                </FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Textarea
                                      placeholder="Write something about yourself (max 300 characters long)"
                                      className="resize-y w-full max-w-full max-h-[150px]"
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
                                        className="h-[342px]"
                                        onEmojiSelect={({ emoji }) => {
                                          field.onChange(
                                            `${field.value} ${emoji}`
                                          );
                                        }}>
                                        <EmojiPickerSearch />
                                        <EmojiPickerContent />
                                        <EmojiPickerFooter />
                                      </EmojiPicker>
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
                              <FormItem className="space-y-1">
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
                                    placeholder="https://example.com"
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
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4">
                                <div className="flex flex-col justify-center min-h-[2rem]">
                                  <FormLabel className="text-base">
                                    Private Account
                                  </FormLabel>
                                  <FormDescription>
                                    When enabled, only approved followers can
                                    see your stories
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
                        </TabsContent>

                        <TabsContent value="social" className="space-y-2 mt-4">
                          <div className="grid gap-4">
                            <div className="space-y-1 mb-4">
                              <h3 className="text-lg font-medium">
                                Social Media Links
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Add your social media handles to connect with
                                your audience
                              </p>
                            </div>

                            <div className="grid gap-4">
                              <FormField
                                control={form.control}
                                name="socialLinks.twitter"
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
                                    <FormLabel className="flex items-center gap-2">
                                      <Twitter className="h-4 w-4" />
                                      Twitter
                                    </FormLabel>
                                    <FormControl>
                                      <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                          twitter.com/
                                        </span>
                                        <Input
                                          placeholder="username"
                                          disabled={loading}
                                          className="rounded-l-none"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="socialLinks.instagram"
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
                                    <FormLabel className="flex items-center gap-2">
                                      <Instagram className="h-4 w-4" />
                                      Instagram
                                    </FormLabel>
                                    <FormControl>
                                      <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                          instagram.com/
                                        </span>
                                        <Input
                                          placeholder="username"
                                          disabled={loading}
                                          className="rounded-l-none"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="socialLinks.facebook"
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
                                    <FormLabel className="flex items-center gap-2">
                                      <Facebook className="h-4 w-4" />
                                      Facebook
                                    </FormLabel>
                                    <FormControl>
                                      <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                          facebook.com/
                                        </span>
                                        <Input
                                          placeholder="username"
                                          disabled={loading}
                                          className="rounded-l-none"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="socialLinks.linkedin"
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
                                    <FormLabel className="flex items-center gap-2">
                                      <Linkedin className="h-4 w-4" />
                                      LinkedIn
                                    </FormLabel>
                                    <FormControl>
                                      <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                          linkedin.com/in/
                                        </span>
                                        <Input
                                          placeholder="username"
                                          disabled={loading}
                                          className="rounded-l-none"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="socialLinks.github"
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
                                    <FormLabel className="flex items-center gap-2">
                                      <Github className="h-4 w-4" />
                                      GitHub
                                    </FormLabel>
                                    <FormControl>
                                      <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                          github.com/
                                        </span>
                                        <Input
                                          placeholder="username"
                                          disabled={loading}
                                          className="rounded-l-none"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <div className="flex justify-end pt-2">
                          <Button
                            type="submit"
                            disabled={
                              !form.formState.isValid ||
                              !usernameAvailable ||
                              isCheckingUsername ||
                              !hasFormChanges ||
                              loading
                            }>
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving changes...
                              </>
                            ) : (
                              "Save changes"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
