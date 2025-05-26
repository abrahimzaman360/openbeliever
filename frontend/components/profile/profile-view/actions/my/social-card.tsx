import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react";
import React from "react";

export default function SocialCards({ user }: { user: User }) {
  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Social Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {user?.socialLinks?.twitter && (
            <a
              href={`https://twitter.com/${user.socialLinks.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {user?.socialLinks?.facebook && (
            <a
              href={`https://facebook.com/${user.socialLinks.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
          )}
          {user?.socialLinks?.instagram && (
            <a
              href={`https://instagram.com/${user.socialLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          )}
          {user?.socialLinks?.linkedin && (
            <a
              href={`https://linkedin.com/in/${user.socialLinks.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {user?.socialLinks?.github && (
            <a
              href={`https://github.com/${user.socialLinks.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
              <Github className="h-5 w-5" />
            </a>
          )}
          {!user?.socialLinks?.twitter &&
            !user?.socialLinks?.facebook &&
            !user?.socialLinks?.instagram &&
            !user?.socialLinks?.linkedin &&
            !user?.socialLinks?.github && (
              <p className="text-sm text-muted-foreground">
                No social links added yet
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
