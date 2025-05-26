import { User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { SERVER_URL } from "@/lib/server";
import LogoutButton from "@/components/authentication/Logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfilePopup({
  currentUser,
}: {
  currentUser: User;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="mt-auto flex items-center bg-slate-50 border border-bg-slate-50 hover:shadow-inner rounded-full space-x-3 p-3 hover:bg-muted cursor-pointer">
          <Avatar className="border-2 size-12 outline-border rounded-full shadow-inner">
            <AvatarImage
              src={`${SERVER_URL}${currentUser.avatar}`}
              className="object-cover  rounded-full"
            />
            <AvatarFallback className="font-semibold rounded-full text-lg">
              {currentUser.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{currentUser.name}</span>
            <span className="text-sm text-muted-foreground">
              @{currentUser.username}
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">
              @{currentUser.username}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-md cursor-pointer" asChild>
          <Link href="/settings/account" className="flex items-center py-1">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer rounded-md text-destructive focus:text-destructive "
          asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
