"use client";

import { Root } from "@radix-ui/react-separator";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
  type JSX,
} from "react";
import { cn } from "@/lib/utils";

export const Separator = forwardRef<
  ComponentRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ): JSX.Element => (
    <Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = Root.displayName;
