import * as React from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = RadixPopover.Root;

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <RadixPopover.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none",
      className,
    )}
    {...props}
  />
));
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixPopover.Content>
>(({ className, sideOffset = 8, align = "center", ...props }, ref) => (
  <RadixPopover.Portal>
    <RadixPopover.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        "z-50 rounded-lg bg-white p-4 shadow-lg border border-gray-200",
        "focus:outline-none animate-fadeIn",
        "data-[side=top]:animate-slideUp data-[side=bottom]:animate-slideDown",
        className,
      )}
      {...props}
    />
  </RadixPopover.Portal>
));
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
