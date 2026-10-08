// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarTrigger } from "../../../components/sidebar/base";
import { NavTitle } from "../../shared/client";
import { SearchTrigger } from "../../shared/slots/search-trigger";
import { useDocsLayout } from "../client";

/**
 * The navbar on mobile, with the title, search and the sidebar trigger.
 */
export function Header(props: ComponentProps<"header">) {
  const {
    isNavTransparent,
    sidebarEnabled,
    props: { nav, searchToggle },
  } = useDocsLayout();
  const searchEnabled = searchToggle?.enabled ?? true;

  return (
    <header
      id="nd-subnav"
      data-transparent={isNavTransparent}
      {...props}
      className={cn(
        "sticky top-(--docs-banner-height,0px) z-30 flex h-(--docs-header-height) items-center gap-2 border-b ps-4 pe-2.5 backdrop-blur-sm transition-colors data-[transparent=false]:bg-background/80 md:hidden",
        props.className,
      )}
    >
      <NavTitle
        nav={nav}
        className="inline-flex items-center gap-2.5 font-semibold"
      />
      <div className="flex-1">{nav?.children}</div>
      {searchEnabled && <SearchTrigger hideIfDisabled {...searchToggle?.sm} />}
      {sidebarEnabled && <SidebarTrigger />}
    </header>
  );
}

/**
 * Shown on desktop while the sidebar is collapsed, to open it again.
 */
export function CollapsedSidebarPanel({
  className,
  ...props
}: ComponentProps<"div">) {
  const { state, isMobile } = useSidebar();
  const {
    props: { searchToggle },
  } = useDocsLayout();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <div
      data-sidebar-panel=""
      inert={!collapsed}
      {...props}
      className={cn(
        "fixed start-4 top-[calc(var(--docs-banner-height,0px)+--spacing(4))] z-20 flex rounded-xl border bg-muted p-0.5 text-muted-foreground shadow-lg transition-opacity max-md:hidden",
        !collapsed && "pointer-events-none opacity-0",
        className,
      )}
    >
      <SidebarTrigger className="rounded-lg" />
      {(searchToggle?.enabled ?? true) && (
        <SearchTrigger hideIfDisabled className="rounded-lg" />
      )}
    </div>
  );
}
