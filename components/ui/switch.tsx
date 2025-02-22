"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { clsx } from "clsx";
import { useState } from "react";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, checked, onCheckedChange }, ref) => {
  return (
    <SwitchPrimitives.Root
      ref={ref}
      checked={checked}
      onCheckedChange={(newChecked) => {
        onCheckedChange?.(newChecked);
      }}
      className={clsx(
        "relative inline-flex h-4 w-7 items-center rounded-full border-2",
        checked ? "bg-blue-900 border-none" : "bg-white border-blue-900",
        className,
      )}
    >
      <SwitchPrimitives.Thumb
        className={clsx(
          "absolute left-1 top-1 h-2 w-2 rounded-full transition-all",
          checked
            ? "translate-x-3 bg-white scale-110"
            : "bg-blue-900 scale-110 -translate-y-1/4 -translate-x-1/4",
        )}
      />
    </SwitchPrimitives.Root>
  );
});

Switch.displayName = "Switch";

export { Switch };
