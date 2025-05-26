import { SignUpComponent } from "@/components/authentication/Sign-Up";
import { GalleryVerticalEnd } from "lucide-react";

export default function SignUpPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-2 md:p-4">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="flex select-none items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <h1 className="font-semibold text-xl">OpenBeliever Inc.</h1>
        </div>
        <SignUpComponent />
      </div>
    </main>
  );
}
