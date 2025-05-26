"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Smartphone, Users, Globe } from "lucide-react";
import Image from "next/image";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-l from-primary/10 to-background pt-16 pb-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Connect with friends in a whole new way
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="max-w-[600px] text-muted-foreground md:text-xl">
                Join millions of people sharing moments, discovering trends, and
                building communities on the fastest growing social platform.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col gap-2 min-[400px]:flex-row">
              <form
                action="/auth/sign-up"
                method="GET"
                className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                />
                <Button type="submit">
                  Join Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                <span>1+ Users</span>
              </div>
              <div className="flex items-center">
                <Globe className="mr-1 h-4 w-4" />
                <span>1+ Countries</span>
              </div>
              <div className="flex items-center">
                <Smartphone className="mr-1 h-4 w-4" />
                <span>Web, iOS & Android</span>
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center">
            <div className="relative h-[400px] w-[300px] sm:h-[450px] sm:w-[350px] md:h-[500px] md:w-[400px]">
              <div className="absolute top-0 left-0 h-full w-full rounded-2xl bg-gradient-to-br from-primary to-primary-foreground/20 opacity-20 blur-3xl" />
              <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/40 bg-background/80 shadow-xl backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background rounded-sm" />
                <Image
                  src="/design/landing.png"
                  width={500}
                  height={600}
                  alt="App screenshot"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover rounded-sm"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute -bottom-6 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full h-auto text-background fill-current">
          <path d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
}
