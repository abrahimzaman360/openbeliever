import { SignInComponent } from "@/components/authentication/Sign-In";
import { GalleryVerticalEnd } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-3 bg-muted px-6 md:px-10">
      <div className="flex w-full max-w-lg flex-col gap-4">
        <div className="flex select-none items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <h1 className="font-semibold text-xl">OpenBeliever Inc.</h1>
        </div>
        <SignInComponent />
      </div>
    </main>
  );
}
