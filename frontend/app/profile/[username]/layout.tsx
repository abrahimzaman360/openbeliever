import { Metadata } from "next";
import { ReactNode } from "react";

export async function generateMetadata(props: any): Promise<Metadata> {
  const username = props.params.username;

  return {
    title: `${username}`,
    description: `Check out ${username}'s profile.`,
  };
}

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <main suppressHydrationWarning>
      <div className="mx-auto flex w-full flex-col">
        <div>{children}</div>
      </div>
    </main>
  );
}
