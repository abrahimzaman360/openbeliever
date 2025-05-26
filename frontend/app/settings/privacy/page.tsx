"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function PrivacyPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSavePrivacy = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Privacy settings updated",
        description: "Your privacy settings have been updated successfully.",
      });
    }, 1000);
  };

  return (
    <Card className="w-full border-none rounded-none shadow-none">
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
        <CardDescription>
          Control your privacy settings and manage how your information is
          shared.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 mx-0 my-4 p-4 mb-0 rounded-sm border shadow-inner">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="postPrivacy">Post Privacy</Label>
              <p className="text-sm text-muted-foreground">
                Make posts visible to everyone
              </p>
            </div>
            <Switch id="postPrivacy" defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="messagingPrivacy">Messaging Privacy</Label>
              <p className="text-sm text-muted-foreground">
                Allow messages from anyone
              </p>
            </div>
            <Switch id="messagingPrivacy" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="notesPrivacy">Notes Privacy</Label>
              <p className="text-sm text-muted-foreground">
                Make notes private by default
              </p>
            </div>
            <Switch id="notesPrivacy" defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="activityStatus">Activity Status</Label>
              <p className="text-sm text-muted-foreground">
                Show when you&apos;re active
              </p>
            </div>
            <Switch id="activityStatus" defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="readReceipts">Read Receipts</Label>
              <p className="text-sm text-muted-foreground">
                Show when you&apos;ve read messages
              </p>
            </div>
            <Switch id="readReceipts" defaultChecked />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSavePrivacy}
          className="ml-auto"
          disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Privacy Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}
