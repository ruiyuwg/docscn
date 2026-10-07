// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import type { ComponentProps } from "react";
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
