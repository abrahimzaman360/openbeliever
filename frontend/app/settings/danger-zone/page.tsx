"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function DangerZonePage() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = () => {
    if (confirmText === "DELETE") {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    } else {
      toast({
        title: "Confirmation failed",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full border-none rounded-none shadow-none">
      <CardHeader className="text-destructive">
        <CardTitle>Danger Zone</CardTitle>
        <CardDescription>
          Actions in this section can permanently delete your data and cannot be
          undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
            <h3 className="font-medium text-destructive mb-2">
              Delete Your Account
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be
              certain. All your data will be permanently removed from our
              servers.
            </p>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmDelete">
                      Type &quot;DELETE&quot; to confirm
                    </Label>
                    <Input
                      id="confirmDelete"
                      placeholder="DELETE"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== "DELETE"}>
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
