import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  BookOpen,
  Share,
} from "lucide-react";

export default function ShareStory({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const shareToSocial = (platform: string) => {
    setIsOpen(false);
  };

  const addToDiary = () => {
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-none cursor-pointer hover:shadow shadow-none hover:border bg-transparent hover:bg-neutral-50">
          <Share className=" h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <h4 className="font-medium leading-none">Share to:</h4>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("Facebook")}>
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("Instagram")}>
              <Instagram className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("Twitter")}>
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("LinkedIn")}>
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="secondary" onClick={addToDiary}>
            <BookOpen className="mr-2 h-4 w-4" /> Add to Daily Diary
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
