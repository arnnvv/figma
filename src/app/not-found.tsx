import Link from "next/link";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { Button } from "@/components/ui/moving-border";
import { JSX } from "react";

export default function NotFound(): JSX.Element {
  const words: { text: string }[] = [
    {
      text: "Oops!",
    },
    {
      text: "Page",
    },
    {
      text: "Not",
    },
    {
      text: "Found",
    },
  ];

  return (
    <div className="h-screen w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex flex-col items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-20 flex flex-col items-center justify-center">
        <TypewriterEffect
          words={words}
          className="text-black dark:text-white"
        />
        <p className="text-neutral-500 max-w-lg mx-auto mt-2 text-center text-lg">
          We&apos;re sorry, but the page you&apos;re looking for seems to have
          wandered off into the digital wilderness.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button
              borderRadius="1.75rem"
              className="bg-white dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              Return Home
            </Button>
          </Link>
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
}
