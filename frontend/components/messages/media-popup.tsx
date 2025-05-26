"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import Image from "next/image";
import { SERVER_URL } from "@/lib/server";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MediaPopupProps {
  media: MessageAttachment[];
  initialIndex: number;
  onClose: () => void;
}

export default function MediaPopup({
  media,
  initialIndex,
  onClose,
}: MediaPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const currentMedia = media[currentIndex];
  const isImage = currentMedia.type === "image";
  const isVideo = currentMedia.type === "video";
  const formattedSrc = currentMedia.url.startsWith("http")
    ? currentMedia.url
    : `${SERVER_URL}${currentMedia.url}`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevMedia();
      if (e.key === "ArrowRight") nextMedia();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
    setLoading(true);
    setError(false);
  };

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
    setLoading(true);
    setError(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/api/disk-engine/download/${currentMedia.url
          .split("/")
          .pop()}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        currentMedia.name || currentMedia.url.split("/").pop() || "download";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Navigation Buttons */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70"
              onClick={prevMedia}>
              <ChevronLeft className="h-6 w-6 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute z-10 right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70"
              onClick={nextMedia}>
              <ChevronRight className="h-6 w-6 text-white" />
            </Button>
          </>
        )}

        {/* Media Display */}
        <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            </div>
          )}
          {error && (
            <div className="text-white text-lg">Failed to load media</div>
          )}
          {isImage && (
            <Image
              src={formattedSrc}
              alt="Media attachment"
              width={1920}
              height={1080}
              className={cn(
                "max-w-[90vw] max-h-[90vh] object-contain transition-opacity duration-200",
                loading ? "opacity-0" : "opacity-100",
                error ? "hidden" : ""
              )}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}
          {isVideo && (
            <video
              ref={videoRef}
              src={formattedSrc}
              controls
              autoPlay
              className={cn(
                "max-w-[90vw] max-h-[90vh] transition-opacity duration-200",
                loading ? "opacity-0" : "opacity-100",
                error ? "hidden" : ""
              )}
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70"
            onClick={handleDownload}>
            <Download className="h-5 w-5 text-white" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70"
            onClick={onClose}>
            <X className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Media Counter */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full">
            {currentIndex + 1} / {media.length}
          </div>
        )}
      </div>
    </div>
  );
}
