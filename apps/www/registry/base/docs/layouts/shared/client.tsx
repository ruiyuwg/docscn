// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import { cn } from "cn";
import { type ComponentProps, type ReactNode, useState } from "react";
import { isLinkItemActive, type LinkItemType, type NavOptions } from ".";

export function LinkItem({
  ref,
  item,
  ...props
}: Omit<ComponentProps<"a">, "href"> & {
  item: Extract<LinkItemType, { url: string }>;
}) {
  const pathname = usePathname();
  const active = isLinkItemActive(item, pathname);

  return (
    <Link
      ref={ref}
      href={item.url}
      external={item.external}
      {...props}
      data-active={active}
    >
      {props.children}
    </Link>
  );
}

/**
 * The title of the navigation (`nav.title`), linking to `nav.url`.
 */
export function NavTitle({
  nav = {},
  href: defaultUrl = "/",
  ...props
}: ComponentProps<"a"> & { nav?: NavOptions }) {
  const { url = defaultUrl, title } = nav;

  if (typeof title === "function") return title({ href: url, ...props });
  return (
    <Link href={url} {...props}>
      {title}
    </Link>
  );
}

/**
 * The place of AI chat, docked by the layout on wide viewports, and floating on smaller ones.
 */
export function AIChatPanel({
  open,
  className,
  children,
}: {
  open: boolean;
  className?: string;
  children: ReactNode;
}) {
  // mount the chat once opened
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  return (
    <aside
      data-state={open ? "open" : "closed"}
      className={cn(
        "z-40 shrink-0 overflow-clip bg-card text-card-foreground transition-[width,translate] duration-300 ease-in-out [--ai-chat-width:min(--spacing(100),100vw---spacing(4))] motion-reduce:transition-none max-xl:fixed max-xl:inset-y-2 max-xl:end-2 max-xl:w-(--ai-chat-width) max-xl:rounded-xl max-xl:border max-xl:shadow-xl",
        open
          ? "w-(--ai-chat-width)"
          : // visible at once when opened, so it can take focus; hidden only after closing
            "invisible w-0 transition-[width,translate,visibility] max-xl:translate-x-[calc(100%+--spacing(2))] rtl:max-xl:-translate-x-[calc(100%+--spacing(2))]",
        className,
      )}
    >
      {/* fixed width while resizing */}
      <div className="flex size-full flex-col xl:w-(--ai-chat-width)">
        {mounted && children}
      </div>
    </aside>
  );
}
