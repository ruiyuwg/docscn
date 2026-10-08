// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { usePathname } from "fumadocs-core/framework";
import type { HTMLAttributes } from "react";
import { isLinkItemActive, type LinkItemType } from "../../layouts/shared";
import { SidebarFolder, SidebarItem } from "./page-tree";

/**
 * Render a link item (from the layout's `links` option) in the sidebar
 */
export function SidebarLinkItem({
  item,
  ...props
}: HTMLAttributes<HTMLElement> & {
  item: Exclude<LinkItemType, { type: "icon" }>;
}) {
  const pathname = usePathname();
  const active = isLinkItemActive(item, pathname);

  if (item.type === "custom")
    return (
      <li className={props.className} style={props.style}>
        {item.children}
      </li>
    );

  if (item.type === "menu")
    return (
      <SidebarFolder
        name={item.text}
        icon={item.icon}
        index={
          item.url
            ? { url: item.url, external: item.external, active }
            : undefined
        }
      >
        {item.items.map((child, i) => (
          <SidebarLinkItem key={i} item={child} />
        ))}
      </SidebarFolder>
    );

  return (
    <SidebarItem
      href={item.url}
      icon={item.icon}
      external={item.external}
      active={active}
      className={props.className}
    >
      {item.text}
    </SidebarItem>
  );
}
