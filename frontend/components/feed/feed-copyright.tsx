import Link from "next/link";

export default function FeedCopyright() {
  return (
    <>
      <div className="text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-2">
          <Link href="#" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:underline">
            Cookie Policy
          </Link>
          <Link href="#" className="hover:underline">
            Accessibility
          </Link>
          <Link href="#" className="hover:underline">
            Ads Info
          </Link>
        </div>
        <p className="mt-2">
          Copyright © 2025 by <span className="font-bold">OpenBeliever</span>,
          Inc.
        </p>
      </div>
    </>
  );
}
