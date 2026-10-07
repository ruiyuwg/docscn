// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Search } from "lucide-react";
import type { ComponentProps } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useSearchContext } from "../../../contexts/search";

export interface SearchTriggerProps
  extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  hideIfDisabled?: boolean;
}

export function SearchTrigger({
  hideIfDisabled,
  size = "icon-sm",
  variant = "ghost",
  ...props
}: SearchTriggerProps) {
  const { enabled, dialogHandle } = useSearchContext();
  if (hideIfDisabled && !enabled) return null;

  return (
    <Dialog.Trigger
      handle={dialogHandle}
      render={<Button size={size} variant={variant} />}
      data-search=""
      aria-label="Open Search"
      {...props}
    >
      <Search />
    </Dialog.Trigger>
  );
}

export interface FullSearchTriggerProps extends ComponentProps<"button"> {
  hideIfDisabled?: boolean;
}

export function FullSearchTrigger({
  hideIfDisabled,
  className,
  ...props
}: FullSearchTriggerProps) {
  const { enabled, hotKey, dialogHandle } = useSearchContext();
  if (hideIfDisabled && !enabled) return null;

  return (
    <Dialog.Trigger
      handle={dialogHandle}
      render={<Button variant="outline" />}
      data-search-full=""
      {...props}
      className={cn(
        "justify-start gap-2 bg-muted/50 px-2 font-normal text-muted-foreground shadow-none dark:bg-input/30",
        className,
      )}
    >
      <Search />
      Search
      <KbdGroup className="ms-auto">
        {hotKey.map((k, i) => (
          <Kbd key={i}>{k.display}</Kbd>
        ))}
      </KbdGroup>
    </Dialog.Trigger>
  );
}
