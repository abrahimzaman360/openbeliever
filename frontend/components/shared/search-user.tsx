"use client";
import { useEffect, useRef, useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { motion } from "motion/react";
import { SERVER_URL } from "@/lib/server";
import { useAuth } from "@/lib/providers/auth-provider";
import { cn } from "@/lib/utils";

interface SearchUserType {
  id: string;
  name: string;
  username: string;
  avatar: string;
  private: boolean;
}

interface SearchUsers {
  users: SearchUserType[];
}

export default function SearchUsers({ classes }: { classes?: string }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { user } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);

  const searchQueryOptions = queryOptions<SearchUsers>({
    queryKey: ["user-search", query],
    queryFn: async () => {
      const response = await fetch(
        `${SERVER_URL}/api/users/search?query=${query}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
    enabled: query.length >= 2,
    retry: false,
    retryOnMount: false,
  });

  const { data: results, isLoading } = useQuery(searchQueryOptions);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderSearchResults = () => {
    if (query.length === 1) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Add one more character to start searching...
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Searching...
        </div>
      );
    }

    if (!results?.users?.length) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No users found
        </div>
      );
    }

    return (
      <ul className="z-30 text-sm text-muted-foreground my-2">
        {results.users.map((eachUser) => (
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-2 p-2 rounded-md hover:bg-muted cursor-pointer"
            key={eachUser.id}>
            <Link
              href={
                user!.id === eachUser.id
                  ? "/profile"
                  : `/profile/${eachUser.username}`
              }
              className="flex items-center space-x-3"
              onClick={() => {
                setQuery(""); // Clear search immediately
                searchRef.current?.blur(); // Remove focus from search
              }}>
              <Avatar>
                <AvatarImage
                  src={
                    eachUser.avatar
                      ? `${SERVER_URL}${eachUser.avatar}`
                      : undefined
                  }
                  alt={eachUser.name ?? eachUser.username}
                />
                <AvatarFallback>
                  {eachUser.name?.[0] ?? eachUser.username[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{eachUser.name}</p>
                <p className="text-sm text-muted-foreground">
                  @{eachUser.username}
                </p>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className={cn("flex justify-center w-full z-10", classes)}
      ref={searchRef}>
      <div className="relative w-full max-w-xl">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-10 w-full rounded-full border border-input bg-background text-sm focus:border-primary focus:ring-0"
        />
        {query && (
          <Button
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setQuery("")}>
            <X className="h-4 w-4" />
          </Button>
        )}

        {(isFocused || query.length >= 1) && (
          <div className="absolute z-10 w-full mt-1 bg-card rounded-md shadow-lg border">
            {!query && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type something to search (min. 2 chars)
              </div>
            )}
            {query && renderSearchResults()}
          </div>
        )}
      </div>
    </div>
  );
}
