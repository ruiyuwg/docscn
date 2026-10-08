// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useTranslations } from "@fuma-translate/react";
import { cn } from "cn";
import type { TOCItemType } from "fumadocs-core/toc";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface InlineTocProps extends Omit<
  ComponentProps<typeof Collapsible>,
  "className"
> {
  items: TOCItemType[];
  className?: string;
}

export function InlineTOC({ items, className, ...props }: InlineTocProps) {
  const t = useTranslations({ note: "inline table of contents" });

  return (
    <Collapsible
      {...props}
      className={cn(
        "not-docs-typeset my-4 rounded-xl border bg-card text-card-foreground",
        className,
      )}
    >
      <CollapsibleTrigger className="group inline-flex w-full items-center justify-between rounded-xl px-4 py-2.5 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {props.children ?? t("Table of Contents")}
        <ChevronDown className="size-4 transition-transform duration-200 group-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col p-4 pt-0 text-sm text-muted-foreground">
          {items.map((item) => (
            <a
              key={item.url}
              href={item.url}
              className="border-s py-1.5 hover:text-foreground"
              style={{
                paddingInlineStart: 12 * Math.max(item.depth - 1, 0),
              }}
            >
              {item.title}
            </a>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
