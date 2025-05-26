"use client";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Video,
  Smile,
  ImageIcon,
  X,
  Loader2,
  XCircle,
  PenIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SERVER_URL } from "@/lib/server";
import Image from "next/image";
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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Attachment {
  file: File;
  type: "image" | "gif" | "video" | "url";
  preview: string;
  url?: string;
}

interface PostType {
  content: string;
  attachments: Attachment[];
  topic: string;
  privacy: "private" | "public" | "followers";
  tags: string[];
}

type TProps = {
  currentUser?: User;
};

// Categories for the new "Topic/Category" select
const categories = [
  { value: "general", label: "General" },
  { value: "philosophy", label: "Philosophy" },
  { value: "science", label: "Science & Technology" },
  { value: "politics", label: "Politics & Governance" },
  { value: "economics", label: "Economics & Finance" },
  { value: "society", label: "Society & Culture" },
  { value: "education", label: "Education & Learning" },
  { value: "environment", label: "Environment & Sustainability" },
  { value: "innovation", label: "Innovation & Future" },
  { value: "ethics", label: "Ethics & Morality" },
  { value: "psychology", label: "Psychology & Behavior" },
] as const;

// Default post data for comparison and reset
const DEFAULT_POST_DATA: PostType = {
  content: "",
  attachments: [],
  topic: "general",
  privacy: "public",
  tags: [],
};

export default function CreatePostComponent({ currentUser }: TProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [postData, setPostData] = useState<PostType>({ ...DEFAULT_POST_DATA });
  const [lastInputTime, setLastInputTime] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);

  // Add ref to track if we're currently editing
  const isEditingRef = useRef(false);

  // Add focus and blur handlers
  const handleFocus = () => {
    isEditingRef.current = true;
  };

  const handleBlur = () => {
    isEditingRef.current = false;
  };

  const removeTag = (tagToRemove: string) => {
    setPostData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Determine if the form is dirty by comparing with default values
  useEffect(() => {
    const hasContent = postData.content.trim() !== "";
    const hasAttachments = postData.attachments.length > 0;
    const hasTags = postData.tags.length > 0;
    const topicChanged = postData.topic !== DEFAULT_POST_DATA.topic;
    const privacyChanged = postData.privacy !== DEFAULT_POST_DATA.privacy;

    setIsDirty(
      hasContent || hasAttachments || hasTags || topicChanged || privacyChanged
    );
  }, [postData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLastInputTime(Date.now());
    isEditingRef.current = true;
    setPostData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttachmentUpload = (type: "gif" | "image" | "video") => {
    const inputRef =
      type === "image"
        ? imageInputRef
        : type === "video"
        ? videoInputRef
        : gifInputRef;
    inputRef.current?.click();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "gif" | "image" | "video"
  ) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: Attachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (
          (type === "image" &&
            file.type.startsWith("image/") &&
            !file.type.endsWith("gif") &&
            !file.type.endsWith("svg")) ||
          (type === "video" && file.type.startsWith("video/")) ||
          (type === "gif" && file.type === "image/gif")
        ) {
          if (postData.attachments.length + newAttachments.length < 6) {
            const preview = URL.createObjectURL(file);
            newAttachments.push({ type, file, preview });
          } else {
            toast.info("Maximum attachments", {
              description: "You can only add up to 6 attachments.",
            });
            break;
          }
        } else {
          toast.error("Invalid file type", {
            description: `${file.name} is not a valid ${type} file.`,
          });
        }
      }
      setPostData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments],
      }));
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setPostData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setPostData({ ...DEFAULT_POST_DATA });
    setInputValue("");
    setError(null);
    setIsDirty(false);
  };

  const createPostMutation = useMutation({
    mutationKey: ["create-post"],
    mutationFn: async (formData: FormData) => {
      const response = await fetch(
        SERVER_URL + "/api/post-machine/posts/create",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (response.status === 400) {
        toast.info("Account Info", {
          description: "Please verify your account first, to create a post.",
        });
        throw new Error("Verify your account first, to create a post.");
      }

      return response.json();
    },
    onSuccess: () => {
      setError(null);
      resetForm();
      setLoading(false);
      queryClient.refetchQueries();
      toast("Post created successfully", {
        description: "Your post has been created successfully.",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast("Error", {
        description: error.message,
      });
      setError(error.message);
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!postData.content || !postData.topic) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("content", postData.content);
    formData.append("topic", postData.topic);
    formData.append("privacy", postData.privacy);
    formData.append("tags", JSON.stringify(postData.tags));

    // Collect images, gifs, and videos into arrays and append them correctly
    const images = postData.attachments
      .filter((attachment) => attachment.type === "image")
      .map((attachment) => attachment.file);

    const gifs = postData.attachments
      .filter((attachment) => attachment.type === "gif")
      .map((attachment) => attachment.file);

    const videos = postData.attachments
      .filter((attachment) => attachment.type === "video")
      .map((attachment) => attachment.file);

    // Append each array as an array field
    images.forEach((file) => formData.append("images[]", file));
    gifs.forEach((file) => formData.append("gifs[]", file));
    videos.forEach((file) => formData.append("videos[]", file));

    setError(null);
    setTimeout(async () => {
      await createPostMutation.mutateAsync(formData);
    }, 3000);
  };

  // Add new function to handle URL preview
  const handleUrlPaste = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);

    if (urls) {
      urls.forEach(async (url) => {
        try {
          const response = await fetch(url);
          const contentType = response.headers.get("content-type");

          if (contentType?.startsWith("image/")) {
            const blob = await response.blob();
            const file = new File([blob], "pasted-image.jpg", {
              type: contentType,
            });
            const preview = URL.createObjectURL(file);

            setPostData((prev) => ({
              ...prev,
              attachments: [
                ...prev.attachments,
                { type: "image", file, preview, url },
              ],
            }));
          }
        } catch (error) {
          console.error("Error processing URL:", error);
        }
      });
    }
  };

  // Add paste handler for the content textarea
  const handlePaste = async (e: React.ClipboardEvent) => {
    if (currentUser?.emailVerified === false) {
      return;
    }
    const items = e.clipboardData.items;
    const text = e.clipboardData.getData("text");

    if (text) {
      handleUrlPaste(text);
    }

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const preview = URL.createObjectURL(file);
          setPostData((prev) => ({
            ...prev,
            attachments: [
              ...prev.attachments,
              {
                type: "image",
                file,
                preview,
              },
            ],
          }));
        }
      }
    }
  };

  const handleAddTag = () => {
    if (postData.tags.length >= 5) {
      toast.info("Maximum 5 tags allowed");
      return;
    }

    const formattedTag = inputValue
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (formattedTag && !postData.tags.includes(formattedTag)) {
      setPostData((prev) => ({
        ...prev,
        tags: [...prev.tags, formattedTag],
      }));
      setInputValue("");
    }
  };

  const handleClose = (isExplicitClose: boolean = false) => {
    if (isEditingRef.current || Date.now() - lastInputTime < 500) {
      return;
    }

    if (isDirty && isExplicitClose) {
      setShowAlertDialog(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleConfirmClose = () => {
    resetForm();
    setIsOpen(false);
    setShowAlertDialog(false);
  };

  const handleCancelClose = () => {
    setShowAlertDialog(false);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClose(true);
          } else {
            setIsOpen(true);
          }
        }}>
        <DialogTrigger asChild>
          <div className="inline-block">
            <Button
              className="w-full cursor-pointer rounded-full"
              onClick={() => setIsOpen(true)}
              role="button"
              tabIndex={0}>
              <PenIcon className="mr-1 h-4 w-4" />
              <span className="hidden md:block">Write a Post</span>
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent
          className="max-w-[480px] md:max-w-xl p-4 pb-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="hidden sm:block">
              Create a new Post
            </DialogTitle>
            <DialogDescription>
              Share your thoughts, experiences, or ideas with the community
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={postData.content}
                className="resize-y max-h-[150px] min-h-[60px]"
                onChange={handleInputChange}
                onPaste={handlePaste}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="What's on your mind?"
                disabled={loading || currentUser?.emailVerified === false}
                required
              />
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={postData.topic}
                  disabled={loading || currentUser?.emailVerified === false}
                  onValueChange={(value) =>
                    setPostData((prev) => ({
                      ...prev,
                      topic: value,
                    }))
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="privacy">Privacy</Label>
                <Select
                  value={postData.privacy}
                  disabled={loading || currentUser?.emailVerified === false}
                  onValueChange={(value) =>
                    setPostData((prev) => ({
                      ...prev,
                      privacy: value as "public" | "private" | "followers",
                    }))
                  }>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Privacy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="followers">Followers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  (press enter to add, max 5)
                </span>
              </Label>
              <div className="relative">
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-9 items-center">
                  {postData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      #{tag}
                      <XCircle
                        className="w-4 h-4 cursor-pointer hover:text-blue-600"
                        onClick={() => removeTag(tag)}
                      />
                    </span>
                  ))}
                  <input
                    id="tags"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      // Handle both Enter and Comma keys
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className={`outline-none flex-1 min-w-24 ${
                      postData.tags.length >= 5 ? "hidden" : ""
                    }`}
                    placeholder={postData.tags.length > 0 ? "" : "Add tags..."}
                    disabled={
                      postData.tags.length >= 5 ||
                      loading ||
                      !currentUser?.emailVerified
                    }
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {/* Display counter only when we have tags or are focused on input */}
                  <span className="text-sm text-gray-500 ml-auto">
                    {postData.tags.length}/5
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 py-2">
              <Label>
                Media{" "}
                <span className="text-sm font-normal">
                  (max. 6 - 10MB each)
                </span>
              </Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAttachmentUpload("image")}
                  disabled={
                    postData.attachments.length >= 6 ||
                    loading ||
                    currentUser?.emailVerified === false
                  }>
                  <ImageIcon className="mr-2 h-4 w-4" /> Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAttachmentUpload("gif")}
                  disabled={
                    postData.attachments.length >= 6 ||
                    loading ||
                    currentUser?.emailVerified === false
                  }>
                  <Smile className="mr-2 h-4 w-4" /> GIF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAttachmentUpload("video")}
                  disabled>
                  <Video className="mr-2 h-4 w-4" /> Video{" "}
                  <span className="font-normal text-sm hidden md:block">
                    (coming soon)
                  </span>
                </Button>
              </div>
              <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => handleFileChange(e, "image")}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                multiple
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="hidden"
                disabled={loading || currentUser?.emailVerified === false}
              />
              <input
                type="file"
                ref={videoInputRef}
                onChange={(e) => handleFileChange(e, "video")}
                accept="video/mp4,video/webm"
                multiple
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="hidden"
                disabled
              />
              <input
                type="file"
                ref={gifInputRef}
                onChange={(e) => handleFileChange(e, "gif")}
                accept="image/gif"
                multiple
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="hidden"
                disabled={loading || currentUser?.emailVerified === false}
              />
              <AnimatePresence>
                {postData.attachments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2">
                    <Label>Attached Files</Label>
                    <div
                      className={`grid gap-2 ${
                        postData.attachments.length <= 2
                          ? "grid-cols-6"
                          : postData.attachments.length <= 3
                          ? "grid-cols-8"
                          : "grid-cols-6"
                      }`}>
                      <AnimatePresence>
                        {postData.attachments.map((attachment, index) => (
                          <motion.div
                            key={`attachment-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="relative group">
                            {attachment.type === "image" ||
                            attachment.type === "gif" ? (
                              <Image
                                src={attachment?.preview}
                                alt={`Preview of ${attachment.file.name}`}
                                width={16}
                                height={16}
                                draggable={false}
                                className={`w-16 h-16 object-cover size-14 rounded`}
                              />
                            ) : (
                              <video
                                src={attachment.preview}
                                draggable={false}
                                className={`w-full object-cover rounded h-16`}
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(index)}
                              className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={`Remove ${attachment.file.name}`}>
                              <X className="h-4 w-4" />
                            </button>
                            <p className="text-xs mt-1 truncate">
                              {attachment.file.name}
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Button
                type="submit"
                className="w-full rounded-full select-none"
                variant={
                  currentUser?.emailVerified === false
                    ? "destructive"
                    : "default"
                }
                disabled={
                  !postData.content ||
                  loading ||
                  currentUser?.emailVerified === false
                }>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : currentUser?.emailVerified === false ? (
                  "Verify account to create a post"
                ) : (
                  "Create Post"
                )}
              </Button>
              {error && (
                <p className=" text-red-400 text-sm text-center">{error}</p>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-full"
              onClick={handleCancelClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full"
              onClick={handleConfirmClose}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
