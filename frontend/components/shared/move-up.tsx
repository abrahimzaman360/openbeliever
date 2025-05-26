"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";

export default function MoveTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-5 right-5">
          <button
            onClick={scrollToTop}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-300 ease-in-out"
            aria-label="Scroll to top">
            <ArrowUp size={18} />
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm whitespace-nowrap">
                  Jump to top
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
