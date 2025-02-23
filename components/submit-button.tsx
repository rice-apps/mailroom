"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      {...props}
      className="text-primary py-5 px-9 rounded-full border border-primary font-normal tracking-wide bg-background hover:bg-background"
    >
      {pending ? pendingText : children}
    </Button>
  );
}
