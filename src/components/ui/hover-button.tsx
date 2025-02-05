"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FC, JSX, ReactNode } from "react";

interface HoverButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
}

export const HoverButton: FC<HoverButtonProps> = ({
  children,
  className,
  ...props
}): JSX.Element => (
  <motion.button
    className={cn(
      "relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
      className,
    )}
    {...props}
  >
    <motion.span
      className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"
      style={{ animationTimingFunction: "linear" }}
    />
    <motion.span
      className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.span>
  </motion.button>
);
