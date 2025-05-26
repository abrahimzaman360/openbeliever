"use client";
import { MessageCircle, PlusCircle } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Button } from "@/components/ui/button";

export default function MessagesTopBar() {
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}>
          <Button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all">
            <PlusCircle className="h-4 w-4" />
            <span>Start a new Conversion</span>
          </Button>
        </motion.div>
      </div>
    </>
  );
}
