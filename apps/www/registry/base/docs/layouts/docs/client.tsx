// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import { type ComponentProps, createContext, use, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTreeOptionsProvider } from "../../components/sidebar/page-tree";
import {
  TreeContextProvider,
  useTabsGroups,
  useTreePath,
} from "../../contexts/tree";
import { useIsScrollTop } from "../../utils/use-is-scroll-top";
import {
  isLayoutTabActive,
  type LayoutTab,
  type LinkItemType,
  useLinkItems,
} from "../shared";
import type { DocsLayoutProps } from ".";
import { Container } from "./slots/container";
import { CollapsedSidebarPanel, Header } from "./slots/header";
import { Sidebar } from "./slots/sidebar";
import { findLast } from "../../utils/array";

interface LayoutProps extends Pick<
  DocsLayoutProps,
  "nav" | "themeSwitch" | "searchToggle"
> {
  tabs: LayoutTab[];
  tabMode: NonNullable<DocsLayoutProps["tabMode"]>;
}

const LayoutContext = createContext<{
  props: LayoutProps;
  isNavTransparent: boolean;
  sidebarEnabled: boolean;
  navItems: LinkItemType[];
  menuItems: LinkItemType[];
} | null>(null);

export function useIsDocsLayout() {
  return use(LayoutContext) !== null;
}

export function useDocsLayout() {
  const context = use(LayoutContext);
  if (!context)
    throw new Error(
      "Please use <DocsPage /> (`components/docs/layouts/docs/page`) under <DocsLayout /> (`components/docs/layouts/docs`).",
    );
  return context;
}

export function LayoutBody(
  props: Omit<DocsLayoutProps, "tabs"> & {
    tabs: LayoutTab[];
  },
) {
  const {
    nav,
    themeSwitch,
    searchToggle,
    sidebar: {
      enabled: sidebarEnabled = true,
      defaultOpenLevel,
      prefetch,
      defaultOpen,
      open,
      onOpenChange,
      collapsible = true,
      ...sidebarProps
    } = {},
    tabs,
    tabMode = "auto",
    tree,
    containerProps,
    children,
  } = props;
  const { enabled: navEnabled = true, transparentMode = "none" } = nav ?? {};
  const isTop = useIsScrollTop({ enabled: transparentMode === "top" }) ?? true;
  const isNavTransparent =
    transparentMode === "top" ? isTop : transparentMode === "always";
  const linkItems = useLinkItems(props);

  return (
    <TreeContextProvider tree={tree}>
      <LayoutContext
        value={{
          props: { tabMode, tabs, nav, themeSwitch, searchToggle },
          isNavTransparent,
          sidebarEnabled,
          ...linkItems,
        }}
      >
        <SidebarTreeOptionsProvider
          defaultOpenLevel={defaultOpenLevel}
          prefetch={prefetch}
        >
          <SidebarProvider
            defaultOpen={defaultOpen}
            open={collapsible ? open : true}
            onOpenChange={onOpenChange}
          >
            {sidebarEnabled && (
              <Sidebar collapsible={collapsible} {...sidebarProps} />
            )}
            <Container
              navEnabled={navEnabled}
              sidebarCollapsible={sidebarEnabled && collapsible}
              {...containerProps}
            >
              {navEnabled && <Header />}
              {sidebarEnabled && collapsible && <CollapsedSidebarPanel />}
              {tabMode === "top" && tabs.length > 0 && (
                <LayoutTabs
                  tabs={tabs}
                  className="z-10 border-b bg-background px-6 pt-3 max-md:hidden xl:px-8"
                />
              )}
              {children}
            </Container>
          </SidebarProvider>
        </SidebarTreeOptionsProvider>
      </LayoutContext>
    </TreeContextProvider>
  );
}

function LayoutTabs({
  tabs: allTabs,
  ...props
}: ComponentProps<"div"> & {
  tabs: LayoutTab[];
}) {
  const pathname = usePathname();
  const path = useTreePath();
  const group = findLast(
    useTabsGroups(allTabs),
    (group) => typeof group.active?.root !== "string",
  );
  const selected = useMemo(() => {
    if (!group) return;
    return findLast(group.options, (option) =>
      isLayoutTabActive(option, path, pathname),
    );
  }, [group, path, pathname]);
  if (!group) return;

  return (
    <div
      {...props}
      className={cn(
        "no-scrollbar flex flex-row items-end gap-6 overflow-auto",
        props.className,
      )}
    >
      {group.options.map((tab, i) => (
        <Link
          key={i}
          href={tab.url}
          className={cn(
            "inline-flex items-center gap-2 border-b-2 border-transparent pb-1.5 text-sm font-medium text-nowrap text-muted-foreground transition-colors hover:text-foreground",
            tab.unlisted && selected !== tab && "hidden",
            selected === tab && "border-primary text-foreground",
          )}
        >
          {tab.title}
        </Link>
      ))}
    </div>
  );
}
