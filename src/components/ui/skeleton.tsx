import { cn } from "@/lib/utils";
import { HTMLAttributes, JSX } from "react";

export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div
    className={cn("animate-pulse rounded-md bg-primary/10", className)}
    {...props}
  />
);
