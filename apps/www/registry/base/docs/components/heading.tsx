// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useTranslations } from "@fuma-translate/react";
import { cn } from "cn";
import { CopyCheckIcon, LinkIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/button";
import { useCopyButton } from "../utils/use-copy-button";

type Types = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingProps<T extends Types> = Omit<ComponentPropsWithoutRef<T>, "as"> & {
  as?: T;
};

export function Heading<T extends Types = "h1">({
  as,
  ...props
}: HeadingProps<T>) {
  const As = as ?? "h1";
  const t = useTranslations({ note: "heading anchor" });
  const [isChecked, onCopy] = useCopyButton(() => {
    if (!props.id) return;

    const url = new URL(window.location.href);
    url.hash = props.id;
    return navigator.clipboard.writeText(url.href);
  });

  if (!props.id) return <As {...props} />;

  return (
    <As
      {...props}
      className={cn(
        "group/heading flex scroll-m-28 flex-row items-center gap-1",
        props.className,
      )}
    >
      <a data-card="" href={`#${props.id}`}>
        {props.children}
      </a>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-live="polite"
        className="not-docs-typeset shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100 focus-visible:opacity-100"
        onClick={onCopy}
      >
        {isChecked ? <CopyCheckIcon /> : <LinkIcon />}
        <span className="sr-only">
          {isChecked
            ? t("Copied Anchor Link", { note: "aria-label" })
            : t("Copy Anchor Link", { note: "aria-label" })}
        </span>
      </Button>
    </As>
  );
}
