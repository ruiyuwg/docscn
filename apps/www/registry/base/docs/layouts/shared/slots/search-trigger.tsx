// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useTranslations } from "@fuma-translate/react";
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
  const t = useTranslations({ note: "search trigger" });
  if (hideIfDisabled && !enabled) return null;

  return (
    <Dialog.Trigger
      handle={dialogHandle}
      render={<Button size={size} variant={variant} />}
      data-search=""
      aria-label={t("Open Search", { note: "aria-label" })}
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
  const t = useTranslations({ note: "search trigger" });
  if (hideIfDisabled && !enabled) return null;

  return (
    <Dialog.Trigger
      handle={dialogHandle}
      render={<Button variant="outline" />}
      data-search-full=""
      {...props}
      // ps-1.75 plus the 1px border lines the icon up with sidebar item text
      className={cn(
        "justify-start gap-2 bg-muted/50 ps-1.75 pe-2 font-normal text-muted-foreground shadow-none dark:bg-input/30",
        className,
      )}
    >
      <Search />
      {t("Search")}
      <KbdGroup className="ms-auto">
        {hotKey.map((k, i) => (
          <Kbd key={i}>{k.display}</Kbd>
        ))}
      </KbdGroup>
    </Dialog.Trigger>
  );
}
