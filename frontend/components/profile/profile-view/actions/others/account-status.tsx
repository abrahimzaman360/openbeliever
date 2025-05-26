"use client";
import { Calendar, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils";

export default function AccountStatus({ user }: { user: User }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:border shadow-inner size-6">
          {!user.private ? (
            <Unlock className="h-4 w-4 text-green-500" />
          ) : (
            <Lock className="h-4 w-4 text-red-500" />
          )}
          <span className="sr-only">
            {!user.private ? "Public Account" : "Private Account"}{" "}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {!user.private ? (
                <Unlock className="h-5 w-5 text-green-500" />
              ) : (
                <Lock className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div>
              <h4 className="font-medium">
                {" "}
                {!user.private ? "Public Account" : "Private Account"}{" "}
              </h4>
              <p className="text-sm text-muted-foreground">
                {!user.private
                  ? "Anyone can see their posts, favourites and stories!"
                  : "Only followers can see their posts, favourites and stories!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium"> Joined Since </h4>
              <p className="text-sm text-muted-foreground">
                {" "}
                {formatDate(new Date("2023-01-01"))}{" "}
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
