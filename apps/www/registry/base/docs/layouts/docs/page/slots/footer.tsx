// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import type * as PageTree from "fumadocs-core/page-tree";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, useMemo } from "react";
import { isActive } from "../../../../utils/urls";
import { useFooterItems } from "../../../../utils/use-footer-items";

type Item = Pick<PageTree.Item, "name" | "description" | "url">;

export interface FooterProps extends ComponentProps<"div"> {
  /**
   * Items including information for the next and previous page
   */
  items?: {
    previous?: Item;
    next?: Item;
  };
}

export function Footer({ items, children, className, ...props }: FooterProps) {
  const footerList = useFooterItems();
  const pathname = usePathname();
  const { previous, next } = useMemo(() => {
    if (items) return items;

    const idx = footerList.findIndex((item) => isActive(item.url, pathname));

    if (idx === -1) return {};
    return {
      previous: footerList[idx - 1],
      next: footerList[idx + 1],
    };
  }, [footerList, items, pathname]);

  return (
    <>
      <div
        className={cn(
          "@container grid gap-4",
          previous && next ? "grid-cols-2" : "grid-cols-1",
          className,
        )}
        {...props}
      >
        {previous && <FooterItem item={previous} index={0} />}
        {next && <FooterItem item={next} index={1} />}
      </div>
      {children}
    </>
  );
}

function FooterItem({ item, index }: { item: Item; index: 0 | 1 }) {
  const Icon = index === 0 ? ChevronLeft : ChevronRight;

  return (
    <Link
      href={item.url}
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-4 text-sm transition-colors hover:bg-accent/80 hover:text-accent-foreground @max-lg:col-span-full",
        index === 1 && "text-end",
      )}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5 font-medium",
          index === 1 && "flex-row-reverse",
        )}
      >
        <Icon className="-mx-1 size-4 shrink-0 rtl:rotate-180" />
        <p>{item.name}</p>
      </div>
      <p className="text-muted-foreground">
        {item.description ?? (index === 0 ? "Previous Page" : "Next Page")}
      </p>
    </Link>
  );
}
