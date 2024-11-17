"use client";

import {
  Content,
  Group,
  Icon,
  Item,
  ItemIndicator,
  ItemText,
  Label,
  Portal,
  Root,
  ScrollDownButton,
  ScrollUpButton,
  SelectContentProps,
  SelectItemProps,
  SelectLabelProps,
  SelectScrollDownButtonProps,
  SelectScrollUpButtonProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  Separator,
  Trigger,
  Value,
  Viewport,
} from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  ForwardedRef,
  forwardRef,
  JSX,
  RefAttributes,
} from "react";

const Select = Root;
const SelectGroup = Group;
const SelectValue = Value;

const SelectTrigger = forwardRef<
  ElementRef<typeof Trigger>,
  ComponentPropsWithoutRef<typeof Trigger>
>(
  (
    {
      className,
      children,
      ...props
    }: Omit<SelectTriggerProps & RefAttributes<HTMLButtonElement>, "ref">,
    ref: ForwardedRef<HTMLButtonElement>,
  ): JSX.Element => (
    <Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className,
      )}
      {...props}
    >
      {children}
      <Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Icon>
    </Trigger>
  ),
);
SelectTrigger.displayName = Trigger.displayName;

const SelectScrollUpButton = forwardRef<
  ElementRef<typeof ScrollUpButton>,
  ComponentPropsWithoutRef<typeof ScrollUpButton>
>(
  (
    {
      className,
      ...props
    }: Omit<SelectScrollUpButtonProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <ScrollUpButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </ScrollUpButton>
  ),
);
SelectScrollUpButton.displayName = ScrollUpButton.displayName;

const SelectScrollDownButton = forwardRef<
  ElementRef<typeof ScrollDownButton>,
  ComponentPropsWithoutRef<typeof ScrollDownButton>
>(
  (
    {
      className,
      ...props
    }: Omit<SelectScrollDownButtonProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <ScrollDownButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </ScrollDownButton>
  ),
);
SelectScrollDownButton.displayName = ScrollDownButton.displayName;

const SelectContent = forwardRef<
  ElementRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(
  (
    {
      className,
      children,
      position = "popper",
      ...props
    }: Omit<SelectContentProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Portal>
      <Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </Viewport>
        <SelectScrollDownButton />
      </Content>
    </Portal>
  ),
);
SelectContent.displayName = Content.displayName;

const SelectLabel = forwardRef<
  ElementRef<typeof Label>,
  ComponentPropsWithoutRef<typeof Label>
>(
  (
    {
      className,
      ...props
    }: Omit<SelectLabelProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Label
      ref={ref}
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...props}
    />
  ),
);
SelectLabel.displayName = Label.displayName;

const SelectItem = forwardRef<
  ElementRef<typeof Item>,
  ComponentPropsWithoutRef<typeof Item>
>(
  (
    {
      className,
      children,
      ...props
    }: Omit<SelectItemProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ItemIndicator>
          <Check className="h-4 w-4" />
        </ItemIndicator>
      </span>

      <ItemText>{children}</ItemText>
    </Item>
  ),
);
SelectItem.displayName = Item.displayName;

const SelectSeparator = forwardRef<
  ElementRef<typeof Separator>,
  ComponentPropsWithoutRef<typeof Separator>
>(
  (
    {
      className,
      ...props
    }: Omit<SelectSeparatorProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  ),
);
SelectSeparator.displayName = Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
