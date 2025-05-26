"use client";

import { useState, useRef } from "react";
import { Download, Expand, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SERVER_URL } from "@/lib/server";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MediaAttachmentProps {
  src: string;
  isCurrentUser: boolean;
  onRemove?: () => void;
  onExpand?: () => void; // New prop to trigger popup
}

export default function MediaAttachment({
  src,
  isCurrentUser,
  onRemove,
  onExpand,
}: MediaAttachmentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const isImage =
    src?.match(/\.(jpeg|jpg|gif|png)$/) || src?.startsWith("data:image");
  const isVideo =
    src?.match(/\.(mp4|webm|ogg)$/) || src?.startsWith("data:video");

  const formattedSrc =
    isImage && !src.startsWith("data:") && !src.startsWith("http")
      ? `${SERVER_URL}${src}`
      : src;

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/api/disk-engine/download/${src.split("/").pop()}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = src?.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive",
      });
    }
  };

  if (isImage) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden rounded-lg cursor-pointer">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="h-8 w-8 rounded-full border-4 border-muted-foreground/30 border-t-primary animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-40 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Failed to load image</p>
            </div>
          )}
          <Image
            src={formattedSrc || "/placeholder.svg"}
            alt="Media attachment"
            width={1024}
            height={600}
            className={cn(
              "object-cover rounded-lg transition-all duration-200 max-h-80 w-full",
              loading ? "opacity-0" : "opacity-100",
              error ? "hidden" : ""
            )}
            onClick={onExpand}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
              onClick={onExpand}>
              <Expand className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="relative group">
        <div className="rounded-lg overflow-hidden bg-black/5 max-h-80">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="h-8 w-8 rounded-full border-4 border-muted-foreground/30 border-t-primary animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-40 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Failed to load video</p>
            </div>
          )}
          <video
            ref={videoRef}
            src={formattedSrc}
            controls={false}
            className={cn(
              "max-w-full transition-all duration-200 h-80 w-full object-cover cursor-pointer",
              loading ? "opacity-0" : "opacity-100",
              error ? "hidden" : ""
            )}
            onClick={onExpand}
            onLoadedData={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            playsInline
          />
          {!loading && !error && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={onExpand}>
              <div className="bg-black/50 rounded-full p-4 transform transition-transform hover:scale-110">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
              onClick={onExpand}>
              <Expand className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg p-4 flex items-center gap-3 transition-colors",
        isCurrentUser
          ? "bg-primary/10 hover:bg-primary/15"
          : "bg-muted hover:bg-muted/80"
      )}>
      <div className="p-2 rounded-md bg-primary/10">
        <Download className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">
          {src?.split("/").pop() || "File"}
        </div>
        <div className="text-xs text-muted-foreground">Click to download</div>
      </div>
      <div className="flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-primary/10"
          onClick={handleDownload}>
          <Download className="h-4 w-4" />
        </Button>
        {onRemove && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-destructive/10"
            onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
