"use client";

import Link from "next/link";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { SparklesCore } from "@/components/ui/sparkles";
import { motion } from "framer-motion";
import { JSX } from "react";
import { HoverButton } from "@/components/ui/hover-button";

export default function NotFound(): JSX.Element {
  const words: { text: string; className?: string }[] = [
    {
      text: "Oops!",
      className:
        "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600",
    },
    {
      text: "Page",
      className:
        "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600",
    },
    {
      text: "Not",
      className:
        "bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600",
    },
    {
      text: "Found",
      className:
        "bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600",
    },
  ];

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4"
      >
        <div className="mb-8">
          <TypewriterEffect
            words={words}
            className="text-4xl md:text-5xl lg:text-6xl font-bold"
            cursorClassName="bg-blue-400"
          />
        </div>

        <p className="text-gray-300 max-w-lg mx-auto mb-8 text-lg">
          We&apos;re sorry, but the page you&apos;re looking for seems to have
          wandered off into the digital wilderness.
        </p>

        <Link href="/" className="inline-block">
          <HoverButton>Return Home</HoverButton>
        </Link>
      </motion.div>
    </div>
  );
}
