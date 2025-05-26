"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Loader2,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { motion } from "motion/react";
import { SERVER_URL } from "@/lib/server";
import { useAuth } from "@/lib/providers/auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogDescription } from "@radix-ui/react-dialog";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function UploadAvatar() {
  const { user, invalidateUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [isFlipped, setIsFlipped] = useState(false); // New state for horizontal flip
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("adjust");

  const uploadMutation = useMutation({
    mutationFn: async (file: Blob) => {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(SERVER_URL + "/api/account/upload-avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload avatar");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Avatar updated successfully");
      setIsDialogOpen(false);
      resetUpload();
      setTimeout(() => {
        invalidateUser();
        router.refresh();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to update avatar");
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(SERVER_URL + "/api/account/remove-avatar", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to remove avatar");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Avatar removed");
      setTimeout(() => {
        invalidateUser();
        router.refresh();
      }, 1000);
    },
    onError: () => {
      toast.error("Failed to remove avatar");
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsDialogOpen(true);
      // Reset editing values
      setZoom(1);
      setRotation(0);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (_: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createCroppedImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imageSrc || !croppedAreaPixels) {
        reject(new Error("No image source or crop area"));
        return;
      }

      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Set dimensions to create a square output
        const size = Math.min(
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );
        canvas.width = size;
        canvas.height = size;

        // Apply rotation and cropping
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        // Apply horizontal flip if needed
        if (isFlipped) {
          ctx.scale(-1, 1);
        }

        // Translate the cropped image
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
          "image/png",
          1
        );
      };

      image.onerror = () => {
        reject(new Error("Error loading image"));
      };
    });
  };

  const handleUpload = async () => {
    try {
      const croppedImage = await createCroppedImage();
      uploadMutation.mutate(croppedImage);
    } catch (error) {
      toast.error("Error processing image");
      console.error(error);
    }
  };

  const resetUpload = () => {
    setImageSrc(null);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setIsFlipped(false); // Reset flip state
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
  };

  const handleRotateLeft = () => {
    setRotation((prev) => {
      const newRotation = prev - 90;
      // Normalize to 0-360 range
      return newRotation < 0 ? newRotation + 360 : newRotation;
    });
  };

  const handleRotateRight = () => {
    setRotation((prev) => {
      const newRotation = prev + 90;
      // Normalize to 0-360 range
      return newRotation >= 360 ? newRotation - 360 : newRotation;
    });
  };

  // New function to toggle horizontal flip
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <Avatar className="size-36 sm:size-48 border-4 sm:border-8 border-zinc-100 shadow-inner">
          <AvatarImage
            src={user?.avatar ? `${SERVER_URL}${user.avatar}` : undefined}
            alt={user?.username || "User"}
          />
          <AvatarFallback className="font-bold text-4xl">
            {user?.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Camera upload overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 rounded-full transition-opacity">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer text-white p-2 rounded-full hover:bg-white/20">
            {uploadMutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
          </label>
        </div>

        {/* Delete button positioned at bottom right */}
        {user?.avatar && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.div
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.2 },
                }}
                className="absolute -bottom-0.5 -right-1">
                <Button
                  size="icon"
                  className="rounded-full border-2 h-8 w-8 hover:shadow-md"
                  disabled={removeAvatarMutation.isPending}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your avatar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-full"
                  disabled={removeAvatarMutation.isPending}
                  onClick={() => removeAvatarMutation.mutate()}>
                  I&apos;m sure!
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogHeader>
          <DialogTitle className="hidden">Edit Avatar</DialogTitle>
          <DialogDescription className="hidden">
            You can edit your avatar
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="sm:max-w-md p-1 border-3 drop-shadow-xl shadow-inner [&>button:last-child]:hidden">
          <div className="flex flex-col gap-4">
            {/* Image Editor */}
            <div className="relative aspect-square w-full bg-muted/30 rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={true}
                  classes={{
                    containerClassName: "rounded-lg",
                    cropAreaClassName: "border-2 border-primary",
                  }}
                />
              )}
            </div>

            {/* Controls */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full py-2">
              <TabsList className="grid w-full grid-cols-2 gap-x-2">
                <TabsTrigger value="adjust" className="w-full">
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Move & Zoom
                </TabsTrigger>
                <TabsTrigger value="rotate" className="w-full">
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Rotate & Flip
                </TabsTrigger>
              </TabsList>

              <TabsContent value="adjust" className="space-y-4 px-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Zoom</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleZoomOut}
                        disabled={zoom <= 1}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm w-10 text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleZoomIn}
                        disabled={zoom >= 3}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.01}
                    onValueChange={(value) => setZoom(value[0])}
                  />
                </div>
              </TabsContent>
              <TabsContent value="rotate" className="space-y-4 px-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rotation</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleRotateLeft}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <span className="text-sm w-10 text-center">
                        {rotation}°
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleRotateRight}>
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  variant={isFlipped ? "default" : "outline"}
                  onClick={handleFlip}
                  className="w-full">
                  <FlipHorizontal className="h-4 w-4 mr-2" />
                  {isFlipped ? "Mirrored" : "Normal"}
                </Button>
              </TabsContent>
            </Tabs>

            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full border-red-500"
                onClick={() => {
                  resetUpload();
                  setIsDialogOpen(false);
                }}>
                Discard
              </Button>
              <Button
                onClick={handleUpload}
                className="w-full"
                disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
