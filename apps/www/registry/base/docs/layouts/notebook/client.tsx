// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import { createContext, use } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTreeOptionsProvider } from "../../components/sidebar/page-tree";
import { TreeContextProvider } from "../../contexts/tree";
import { useIsScrollTop } from "../../utils/use-is-scroll-top";
import { type LayoutTab, type LinkItemType, useLinkItems } from "../shared";
import { AIChatPanel } from "../shared/client";
import type { DocsLayoutProps } from ".";
import { Container } from "./slots/container";
import { Header } from "./slots/header";
import { Sidebar } from "./slots/sidebar";

interface LayoutProps extends Pick<
  DocsLayoutProps,
  "nav" | "themeSwitch" | "searchToggle" | "aiChat"
> {
  tabs: LayoutTab[];
  tabMode: NonNullable<DocsLayoutProps["tabMode"]>;
  sidebarCollapsible: boolean;
}

const LayoutContext = createContext<{
  props: LayoutProps;
  isNavTransparent: boolean;
  navItems: LinkItemType[];
  menuItems: LinkItemType[];
} | null>(null);

export function useNotebookLayout() {
  const context = use(LayoutContext);
  if (!context)
    throw new Error(
      "Please use <DocsPage /> (`components/docs/layouts/notebook/page`) under <DocsLayout /> (`components/docs/layouts/notebook`).",
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
      defaultOpenLevel,
      prefetch,
      defaultOpen,
      open,
      onOpenChange,
      collapsible = true,
      ...sidebarProps
    } = {},
    tabs,
    tabMode = "sidebar",
    tree,
    containerProps,
    aiChat,
    children,
  } = props;
  const {
    enabled: navEnabled = true,
    transparentMode = "none",
    mode: navMode = "auto",
  } = nav ?? {};
  const isTop = useIsScrollTop({ enabled: transparentMode === "top" }) ?? true;
  const isNavTransparent =
    transparentMode === "top" ? isTop : transparentMode === "always";
  const linkItems = useLinkItems(props);

  return (
    <TreeContextProvider tree={tree}>
      <LayoutContext
        value={{
          props: {
            tabMode,
            tabs,
            nav,
            themeSwitch,
            searchToggle,
            sidebarCollapsible: collapsible,
            aiChat,
          },
          isNavTransparent,
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
            <Container navEnabled={navEnabled} {...containerProps}>
              {navEnabled && navMode === "top" && <Header />}
              <div className="flex flex-1">
                <Sidebar collapsible={collapsible} {...sidebarProps} />
                <SidebarInset className="min-w-0">
                  {navEnabled && navMode === "auto" && <Header />}
                  {children}
                </SidebarInset>
                {aiChat?.panel && (
                  <AIChatPanel
                    open={aiChat.open}
                    className={cn(
                      "xl:sticky xl:data-[state=open]:border-s",
                      navEnabled && navMode === "top"
                        ? // below the navbar
                          "xl:top-[calc(var(--docs-banner-height,0px)+var(--docs-header-height))] xl:h-[calc(100svh-var(--docs-banner-height,0px)-var(--docs-header-height))]"
                        : "xl:top-(--docs-banner-height,0px) xl:h-[calc(100svh-var(--docs-banner-height,0px))]",
                    )}
                  >
                    {aiChat.panel}
                  </AIChatPanel>
                )}
              </div>
            </Container>
          </SidebarProvider>
        </SidebarTreeOptionsProvider>
      </LayoutContext>
    </TreeContextProvider>
  );
}
