"use client";

import {
  Image as AvatarImageProperty,
  Fallback,
  Root,
} from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, ComponentRef, forwardRef, JSX } from "react";

const AvatarSHAD = forwardRef<
  ComponentRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root>
>(
  ({ className, ...props }, ref): JSX.Element => (
    <Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  ),
);
AvatarSHAD.displayName = Root.displayName;

const AvatarImage = forwardRef<
  ComponentRef<typeof AvatarImageProperty>,
  ComponentPropsWithoutRef<typeof AvatarImageProperty>
>(
  ({ className, ...props }, ref): JSX.Element => (
    <AvatarImageProperty
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  ),
);
AvatarImage.displayName = AvatarImageProperty.displayName;

const AvatarFallback = forwardRef<
  ComponentRef<typeof Fallback>,
  ComponentPropsWithoutRef<typeof Fallback>
>(
  ({ className, ...props }, ref): JSX.Element => (
    <Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className,
      )}
      {...props}
    />
  ),
);
AvatarFallback.displayName = Fallback.displayName;

export { AvatarSHAD, AvatarImage, AvatarFallback };
