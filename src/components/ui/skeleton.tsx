import type { HTMLAttributes, JSX } from "react";
import { cn } from "@/lib/utils";

export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div
    className={cn("animate-pulse rounded-md bg-primary/10", className)}
    {...props}
  />
);
