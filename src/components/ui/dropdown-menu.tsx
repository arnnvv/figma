"use client";

import {
  CheckboxItem,
  Content,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuSubContentProps,
  type DropdownMenuSubTriggerProps,
  Group,
  Item,
  ItemIndicator,
  Label,
  Portal,
  RadioGroup,
  RadioItem,
  Root,
  Separator,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
} from "@radix-ui/react-dropdown-menu";
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type ForwardedRef,
  forwardRef,
  type HTMLAttributes,
  type JSX,
  type RefAttributes,
} from "react";

const DropdownMenu = Root;
const DropdownMenuTrigger = Trigger;
const DropdownMenuGroup = Group;
const DropdownMenuPortal = Portal;
const DropdownMenuSub = Sub;
const DropdownMenuRadioGroup = RadioGroup;

const DropdownMenuSubTrigger = forwardRef<
  ComponentRef<typeof SubTrigger>,
  ComponentPropsWithoutRef<typeof SubTrigger> & {
    inset?: boolean;
  }
>(
  (
    {
      className,
      inset,
      children,
      ...props
    }: Omit<
      DropdownMenuSubTriggerProps & RefAttributes<HTMLDivElement>,
      "ref"
    > & { inset?: boolean | undefined },
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </SubTrigger>
  ),
);
DropdownMenuSubTrigger.displayName = SubTrigger.displayName;

const DropdownMenuSubContent = forwardRef<
  ComponentRef<typeof SubContent>,
  ComponentPropsWithoutRef<typeof SubContent>
>(
  (
    {
      className,
      ...props
    }: Omit<DropdownMenuSubContentProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <SubContent
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuSubContent.displayName = SubContent.displayName;

const DropdownMenuContent = forwardRef<
  ComponentRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(
  (
    {
      className,
      sideOffset = 4,
      ...props
    }: Omit<DropdownMenuContentProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Portal>
      <Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </Portal>
  ),
);
DropdownMenuContent.displayName = Content.displayName;

const DropdownMenuItem = forwardRef<
  ComponentRef<typeof Item>,
  ComponentPropsWithoutRef<typeof Item> & {
    inset?: boolean;
  }
>(
  (
    {
      className,
      inset,
      ...props
    }: Omit<DropdownMenuItemProps & RefAttributes<HTMLDivElement>, "ref"> & {
      inset?: boolean | undefined;
    },
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuItem.displayName = Item.displayName;

const DropdownMenuCheckboxItem = forwardRef<
  ComponentRef<typeof CheckboxItem>,
  ComponentPropsWithoutRef<typeof CheckboxItem>
>(
  (
    {
      className,
      children,
      checked,
      ...props
    }: Omit<
      DropdownMenuCheckboxItemProps & RefAttributes<HTMLDivElement>,
      "ref"
    >,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <CheckboxItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </ItemIndicator>
      </span>
      {children}
    </CheckboxItem>
  ),
);
DropdownMenuCheckboxItem.displayName = CheckboxItem.displayName;

const DropdownMenuRadioItem = forwardRef<
  ComponentRef<typeof RadioItem>,
  ComponentPropsWithoutRef<typeof RadioItem>
>(
  (
    {
      className,
      children,
      ...props
    }: Omit<DropdownMenuRadioItemProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <RadioItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ItemIndicator>
          <DotFilledIcon className="h-4 w-4 fill-current" />
        </ItemIndicator>
      </span>
      {children}
    </RadioItem>
  ),
);
DropdownMenuRadioItem.displayName = RadioItem.displayName;

const DropdownMenuLabel = forwardRef<
  ComponentRef<typeof Label>,
  ComponentPropsWithoutRef<typeof Label> & {
    inset?: boolean;
  }
>(
  (
    {
      className,
      inset,
      ...props
    }: Omit<DropdownMenuLabelProps & RefAttributes<HTMLDivElement>, "ref"> & {
      inset?: boolean | undefined;
    },
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Label
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuLabel.displayName = Label.displayName;

const DropdownMenuSeparator = forwardRef<
  ComponentRef<typeof Separator>,
  ComponentPropsWithoutRef<typeof Separator>
>(
  (
    {
      className,
      ...props
    }: Omit<DropdownMenuSeparatorProps & RefAttributes<HTMLDivElement>, "ref">,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  ),
);
DropdownMenuSeparator.displayName = Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>): JSX.Element => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
