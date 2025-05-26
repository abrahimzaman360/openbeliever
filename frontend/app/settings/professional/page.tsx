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

export default function ProfessionalPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfessional = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Professional settings updated",
        description:
          "Your professional settings have been updated successfully.",
      });
    }, 1000);
  };

  return (
    <Card className="w-full border-none rounded-none shadow-none">
      <CardHeader>
        <CardTitle>Professional Mode</CardTitle>
        <CardDescription>
          Configure professional features and analytics for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 border shadow-inner p-4 mx-5 mb-0 rounded-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="professionalMode">Professional Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable professional features
              </p>
            </div>
            <Switch id="professionalMode" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Track engagement with your content
              </p>
            </div>
            <Switch id="analytics" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="insights">Audience Insights</Label>
              <p className="text-sm text-muted-foreground">
                View detailed audience demographics
              </p>
            </div>
            <Switch id="insights" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="scheduling">Content Scheduling</Label>
              <p className="text-sm text-muted-foreground">
                Schedule posts for optimal times
              </p>
            </div>
            <Switch id="scheduling" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 mt-4">
          <Button
            onClick={handleSaveProfessional}
            className="ml-auto justify-end rounded-full"
            disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
