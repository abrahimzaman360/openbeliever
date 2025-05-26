"use client";

import { cn } from "@/lib/utils";

export default function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex items-center space-x-1 bg-muted p-2 rounded-2xl">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <style jsx global>{`
          .typing-dot {
            width: 8px;
            height: 8px;
            background-color: #888;
            border-radius: 50%;
            animation: typing-animation 1.4s infinite ease-in-out both;
          }

          .typing-dot:nth-child(1) {
            animation-delay: -0.32s;
          }

          .typing-dot:nth-child(2) {
            animation-delay: -0.16s;
          }

          @keyframes typing-animation {
            0%,
            80%,
            100% {
              transform: scale(0.6);
              opacity: 0.6;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
