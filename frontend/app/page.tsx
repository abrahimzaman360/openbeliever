import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto">
      <Hero />
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
}
