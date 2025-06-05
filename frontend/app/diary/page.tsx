"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  PlusCircle,
  Pin,
  PinOff,
  Trash,
  Share,
  Send,
  Edit,
  Edit2,
  Flower2,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SERVER_URL } from "@/lib/server";
import { motion } from "motion/react";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
}

// Local storage service
const diaryService = {
  getEntries: async (): Promise<DiaryEntry[]> => {
    const response = await fetch(`${SERVER_URL}/api/diary-engine/diary`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch diary entries");
    }
    return response.json();
  },
  createEntry: async (entry: Omit<DiaryEntry, "id">): Promise<DiaryEntry> => {
    const response = await fetch(`${SERVER_URL}/api/diary-engine/diary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error("Failed to create diary entry");
    }
    return response.json();
  },
  updateEntry: async (entry: DiaryEntry): Promise<DiaryEntry> => {
    const response = await fetch(
      `${SERVER_URL}/api/diary-engine/diary/${entry.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(entry),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update diary entry");
    }
    return response.json();
  },
  deleteEntry: async (id: string): Promise<void> => {
    const response = await fetch(`${SERVER_URL}/api/diary-engine/diary/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to delete diary entry");
    }
  },
};

export default function DailyDiary() {
  const [open, setOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "stack">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Query to fetch entries
  const { data: entries = [], isLoading } = useQuery<DiaryEntry[], Error>({
    queryKey: ["diaryEntries"],
    queryFn: diaryService.getEntries,
  });

  // Create Notes Mutation:
  const createEntryMutation = useMutation<
    DiaryEntry,
    Error,
    Omit<DiaryEntry, "id">,
    void
  >({
    mutationFn: (entry) => diaryService.createEntry(entry),
    onSuccess: (newEntry) => {
      queryClient.setQueryData<DiaryEntry[]>(["diaryEntries"], (oldData) => {
        if (oldData) {
          return [...oldData, newEntry];
        }
        return [newEntry];
      });
    },
    onError: (error) => {
      console.error(error);
      // Display error message to user, e.g., using state or toast
    },
  });

  // Update Notes Mutation:
  const updateEntryMutation = useMutation<DiaryEntry, Error, DiaryEntry, void>({
    mutationFn: (entry) => diaryService.updateEntry(entry),
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData<DiaryEntry[]>(["diaryEntries"], (oldData) => {
        if (oldData) {
          return oldData.map((e) =>
            e.id === updatedEntry.id ? updatedEntry : e
          );
        }
        return [updatedEntry];
      });
    },
    onError: (error) => {
      console.error(error);
      // Display error message to user
    },
  });

  // Delete Notes Mutation:
  const deleteEntryMutation = useMutation<void, Error, string, void>({
    mutationFn: (id) => diaryService.deleteEntry(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<DiaryEntry[]>(["diaryEntries"], (oldData) => {
        if (oldData) {
          return oldData.filter((e) => e.id !== id);
        }
        return [];
      });
    },
    onError: (error) => {
      console.error(error);
      // Display error message to user
    },
  });

  // Determine view mode based on number of entries
  useEffect(() => {
    if (entries.length > 6) {
      setViewMode("stack");
    } else {
      setViewMode("grid");
    }
  }, [entries.length]);

  const handleNewEntry = () => {
    setCurrentEntry({
      id: "",
      title: "",
      content: "",
      date: new Date().toISOString(),
      isPinned: false,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (currentEntry) {
      if (currentEntry.id) {
        updateEntryMutation.mutate(currentEntry);
      } else {
        createEntryMutation.mutate(currentEntry);
      }
      setOpen(false);
      setCurrentEntry(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteEntryMutation.mutate(id);
  };

  const togglePin = (id: string) => {
    const entryToUpdate = entries.find((entry) => entry.id === id);
    if (entryToUpdate) {
      entryToUpdate.isPinned = !entryToUpdate.isPinned;
      updateEntryMutation.mutate(entryToUpdate);
    }
  };

  // Local
  const handleEdit = (entry: DiaryEntry) => {
    setCurrentEntry(entry);
    setOpen(true);
  };

  const shareAsMessage = (entry: DiaryEntry) => {
    // In a real app, this would open a share dialog or messaging interface
    console.log("Me");
  };

  const shareAsPost = (entry: DiaryEntry) => {
    // In a real app, this would publish the entry as a post
    console.log("Me");
  };

  // Copy Content of Note
  const handleCopy = (entry: DiaryEntry) => {
    const text = `${entry.title}\n\n${entry.content}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(entry.id);
        setTimeout(() => setCopiedId(null), 2000);
        console.log("Sucess to Copy!");
      })
      .catch(() => {
        console.log("Failed to Copy!");
      });
  };

  // Sort entries: newest first
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderEntry = (entry: DiaryEntry) => (
    <motion.div
      key={entry.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}>
      <Card
        className={cn(
          "transition-all hover:shadow-md mt-2 border-2 flex pb-4 pt-0 flex-col rounded-lg"
        )}>
        {/* Header */}
        <CardHeader className="pt-4 pb-0">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {entry.title || "Untitled"}
            </CardTitle>
          </div>
          <CardDescription className="pt-0">
            {format(new Date(entry.date), "PPP")}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow ">
          <ScrollArea className="h-full rounded-md">
            <p className="text-sm rounded-md">{entry.content}</p>
          </ScrollArea>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex justify-between py-0 mt-2 mb-0">
          {/* Share & Copy Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                togglePin(entry.id);
              }}>
              {entry.isPinned ? (
                <PinOff className="h-4 w-4 text-red-500" />
              ) : (
                <Pin className="h-4 w-4 text-primary" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={(e) => e.stopPropagation()}>
                  <Share className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => shareAsMessage(entry)}>
                  <Send className="h-4 w-4 mr-2" />
                  Share as Message
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => shareAsPost(entry)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Share as Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(entry);
              }}>
              {copiedId === entry.id ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Edit & Delete Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(entry);
              }}>
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-red-600 hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(entry.id);
              }}>
              <Trash className="h-4 w-4 text-white" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div>
      <div className="w-full">


        <ScrollArea className="overflow-y-scroll h-screen  px-4">
          <div className="flex justify-between items-center px-2 py-4">
            <h1 className="text-3xl font-extrabold">My Diary</h1>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}>
              <Button
                onClick={handleNewEntry}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all">
                <PlusCircle className="h-4 w-4" />
                <span>Write a Note</span>
              </Button>
            </motion.div>
          </div>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="mr-2">
              {sortedEntries.length > 0 && (
                <>
                  <div className="mb-6">
                    <div
                      className={cn(
                        "ml-2",
                        viewMode === "grid"
                          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                          : "flex flex-col gap-3"
                      )}>
                      {sortedEntries.map(renderEntry)}
                    </div>
                  </div>
                </>
              )}

              {sortedEntries.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No notes yet. Click &apos;New Entry&apos; to create your first
                  note.
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-w-sm rounded-md" onInteractOutside={(e) => {
          e.preventDefault()
        }}>
          <DialogHeader>
            <DialogTitle>
              {currentEntry?.id && entries.some((e) => e.id === currentEntry.id)
                ? "Edit Entry"
                : "New Entry"}
            </DialogTitle>
            <DialogDescription>
              {currentEntry?.date
                ? format(new Date(currentEntry.date), "PPP")
                : format(new Date(), "PPP")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-2">
            <Input
              placeholder="Title"
              value={currentEntry?.title || ""}
              onChange={(e) =>
                setCurrentEntry((prev) =>
                  prev ? { ...prev, title: e.target.value } : null
                )
              }
            />
            <Textarea
              placeholder="What's on your mind today?"
              className="min-h-[100px]"
              value={currentEntry?.content || ""}
              onChange={(e) =>
                setCurrentEntry((prev) =>
                  prev ? { ...prev, content: e.target.value } : null
                )
              }
            />
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1 rounded-full"
                onClick={() =>
                  setCurrentEntry((prev) =>
                    prev ? { ...prev, isPinned: !prev.isPinned } : null
                  )
                }>
                {currentEntry?.isPinned ? (
                  <>
                    <PinOff className="h-4 w-4" /> Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4" /> Pin
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:gap-y-0 gap-y-1">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-full">
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const SkeletonCard = () => (
  <div className="animate-pulse p-2 mx-2 my-2 bg-white">
    <div className="h-6 bg-gray-200 rounded-md mb-3 w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded-md mb-2 w-full"></div>
    <div className="h-4 bg-gray-200 rounded-md mb-2 w-5/6"></div>
    <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
  </div>
);
