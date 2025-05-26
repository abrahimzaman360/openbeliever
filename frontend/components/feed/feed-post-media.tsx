"use client";
import { AlertCircle, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Alert, AlertDescription } from "../ui/alert";
import { MEDIA_URL } from "@/lib/server";
import { safeJSONParse } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface PostMediaProps {
  attachments: {
    images: string[];
    videos: string[];
    gifs: string[];
  };
}

interface ImageVariants {
  thumb: string;
  medium: string;
  large: string;
}

export default function PostMediaView({ attachments }: PostMediaProps) {
  const parsedAttachments =
    safeJSONParse<PostMediaProps["attachments"]>(attachments);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [currentSizeVariant, setCurrentSizeVariant] = useState<
    "thumb" | "medium" | "large"
  >("medium");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    // Set initial window size
    setWindowWidth(window.innerWidth);

    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Determine appropriate image size based on screen width
    if (windowWidth <= 640) {
      setCurrentSizeVariant("thumb");
    } else if (windowWidth <= 1024) {
      setCurrentSizeVariant("medium");
    } else {
      setCurrentSizeVariant("large");
    }
  }, [windowWidth]);

  const allMedia = [
    ...(parsedAttachments.images || []),
    ...(parsedAttachments.gifs || []),
    ...(parsedAttachments.videos || []),
  ];

  // Group media by their base name to identify variants
  const groupedMedia: Record<string, ImageVariants> = {};

  allMedia.forEach((path) => {
    // Extract base name and size variant
    const match = path.match(
      /(.+)_(thumb|medium|large)\.(jpeg|jpg|png|gif|mp4)$/i
    );
    if (match) {
      const [, basePath, size, extension] = match;
      const baseKey = `${basePath}.${extension}`;

      if (!groupedMedia[baseKey]) {
        groupedMedia[baseKey] = { thumb: "", medium: "", large: "" };
      }

      groupedMedia[baseKey][size as keyof ImageVariants] = path;
    }
  });

  // Convert grouped media back to array for rendering
  const mediaItems = Object.values(groupedMedia);

  const openFullPreview = (src: string) => {
    // Use the largest available variant for the preview
    const variants = mediaItems.find(
      (item) => item.medium === src || item.thumb === src || item.large === src
    );

    const fullSizeSrc =
      variants?.large || variants?.medium || variants?.thumb || src;
    setPreviewImage(`${MEDIA_URL}${fullSizeSrc}`);
    setPreviewOpen(true);
  };

  return (
    <>
      <div className="mt-2 border rounded-md overflow-hidden h-[220px] md:h-[300px]">
        {mediaItems.length > 0 ? (
          <Carousel className="w-full h-[300px] shadow-none drop-shadow-none">
            <CarouselContent className="w-full h-[300px] m-0">
              {mediaItems.map((variants, idx) => {
                const src =
                  variants[currentSizeVariant] ||
                  variants.medium ||
                  variants.large ||
                  variants.thumb;
                if (!src) return null;

                return (
                  <CarouselItem
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative w-full h-[220px] md:h-[300px]">
                    <Image
                      src={`${MEDIA_URL}${src}`}
                      alt={`Post media ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority
                      className={`object-cover w-full h-full transition-all duration-300 ${
                        hoveredIndex === idx ? "opacity-80 blur-[2px]" : ""
                      }`}
                    />
                    <div className="relative w-full h-full">
                      {hoveredIndex === idx && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="lg"
                            className="bg-black/30 text-white border-white/50 backdrop-blur-sm hover:bg-black/50"
                            onClick={() => openFullPreview(src)}>
                            <Maximize2 className="mr-2 h-4 w-4" />
                            View Full Size
                          </Button>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <Alert className="size-full flex flex-col items-center justify-center space-y-4 bg-gray-100 border-dashed">
            <div>
              <AlertCircle className="h-12 w-12 text-gray-500" />
            </div>
            <AlertDescription className="text-lg font-semibold text-gray-600">
              No media found
            </AlertDescription>
            <p className="text-sm text-gray-500">
              This post doesn&apos;t contain any images or videos.
            </p>
          </Alert>
        )}
      </div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogHeader className="hidden p-0">
          <DialogTitle className="hidden">Preview Image</DialogTitle>
          <DialogDescription className="hidden">
            You can preview image here
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="max-w-[90vw] border-none p-0 overflow-hidden">
          <div className="relative w-full h-[90vh] rounded-sm">
            <Image
              src={previewImage || "/placeholder.svg"}
              alt="Full size preview"
              fill
              className="rounded-md object-cover"
              sizes="90vw"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
