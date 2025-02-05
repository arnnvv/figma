"use client";

import { type FC, type JSX, useEffect } from "react";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export const TypewriterEffect: FC<{
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}> = ({ words, className, cursorClassName }): JSX.Element => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: "easeInOut",
        },
      );
    }
  }, [isInView, animate]);

  const renderWords = (): JSX.Element => (
    <motion.div ref={scope} className="inline">
      {wordsArray.map((word, idx) => {
        return (
          <div key={`word-${idx}`} className="inline-block">
            {word.text.map((letter, letterIdx) => (
              <motion.span
                initial={{
                  opacity: 0,
                  display: "none",
                }}
                key={`${letter}-${letterIdx}`}
                className={cn(word.className)}
              >
                {letter}
              </motion.span>
            ))}
            &nbsp;
          </div>
        );
      })}
    </motion.div>
  );

  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className,
      )}
    >
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName,
        )}
      ></motion.span>
    </div>
  );
};
