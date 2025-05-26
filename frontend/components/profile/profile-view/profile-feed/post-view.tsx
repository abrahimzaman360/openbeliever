import { Card, CardContent } from "@/components/ui/card";
import { MEDIA_URL } from "@/lib/server";
import { safeJSONParse } from "@/lib/utils";
import { Bookmark, Heart, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type UserProps = {
  currentUser: User;
};

export default function PostFeedViewComponent({ currentUser }: UserProps) {
  return (
    <div>
      {currentUser && currentUser!.posts!.total! > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {currentUser!.posts.list.data.map((post, i) => {
            const attachment = safeJSONParse<{
              gifs: string[];
              images: string[];
              videos: string[];
            }>(post.attachments);
            const imageUrl = attachment?.images?.[0];
            const videoUrl = attachment?.videos?.[0];
            const gifUrl = attachment?.gifs?.[0];

            return (
              <Link href={`/post/${post.id}`} key={i}>
                <Card className="hover:cursor-pointer">
                  <CardContent className="p-0">
                    <div
                      className={`relative w-full h-60 rounded-sm overflow-hidden ${
                        gifUrl || videoUrl || imageUrl ? "group" : ""
                      }`}>
                      {gifUrl ? (
                        // Render GIF (autoplay always)
                        <div className="absolute inset-0">
                          <Image
                            src={`${MEDIA_URL}${gifUrl}`}
                            alt="GIF"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : videoUrl ? (
                        // Render video (autoplay on hover)
                        <div className="absolute inset-0">
                          <video
                            src={`${MEDIA_URL}${videoUrl}`}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            autoPlay={false}
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                        </div>
                      ) : imageUrl ? (
                        // Render image
                        <div className="absolute inset-0">
                          <Image
                            src={`${MEDIA_URL}${imageUrl}`}
                            alt="Image"
                            width={500}
                            height={500}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        // Default fallback if no media
                        <div className="absolute inset-0 bg-black flex flex-col justify-center text-center items-center text-white font-bold">
                          <div className="flex flex-row-reverse gap-x-8 items-center">
                            <div className="flex flex-row items-center gap-x-2">
                              {post.likes?.length}
                              <Heart className="w-4 h-4" />
                            </div>
                            <div className="flex flex-row items-center gap-x-2">
                              {post.favorites?.length}
                              <Bookmark className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      )}

                      {(gifUrl || videoUrl || imageUrl) && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center text-white text-center transition-opacity duration-300">
                          <div className="flex flex-row-reverse gap-x-8 items-center">
                            <div className="flex flex-row items-center gap-x-2">
                              {post.likes?.length}
                              <Heart className="w-4 h-4" />
                            </div>
                            <div className="flex flex-row items-center gap-x-2">
                              {post.favorites?.length}
                              <Bookmark className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-10">
          <Info className="w-16 h-16 text-gray-400" />
          <p className="text-center text-muted-foreground pt-4">
            No posts to show yet!
          </p>
        </div>
      )}
    </div>
  );
}
