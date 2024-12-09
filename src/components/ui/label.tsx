"use client";

import { LabelProps, Root } from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  ComponentPropsWithoutRef,
  ComponentRef,
  ForwardedRef,
  forwardRef,
  JSX,
  RefAttributes,
} from "react";
import { ClassProp } from "class-variance-authority/types";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

export const Label = forwardRef<
  ComponentRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root> & VariantProps<typeof labelVariants>
>(
  (
    {
      className,
      ...props
    }: Omit<LabelProps & RefAttributes<HTMLLabelElement>, "ref"> &
      VariantProps<(props?: ClassProp | undefined) => string>,
    ref: ForwardedRef<HTMLLabelElement>,
  ): JSX.Element => (
    <Root ref={ref} className={cn(labelVariants(), className)} {...props} />
  ),
);
Label.displayName = Root.displayName;
