// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import type * as PageTree from "fumadocs-core/page-tree";
import type { ComponentProps } from "react";
import type { SidebarTreeOptions } from "../../components/sidebar/page-tree";
import {
  type BaseLayoutProps,
  getLayoutTabs,
  type GetLayoutTabsOptions,
  type LayoutTab,
} from "../shared";
import { LayoutBody } from "./client";
import type { SidebarProps } from "./slots/sidebar";

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;
  sidebar?: SidebarOptions;
  tabMode?: "top" | "auto";
  tabs?: LayoutTab[] | GetLayoutTabsOptions | false;
  containerProps?: ComponentProps<"main">;
}

export interface SidebarOptions extends SidebarProps, SidebarTreeOptions {
  /**
   * Show the sidebar
   *
   * @defaultValue true
   */
  enabled?: boolean;

  /**
   * Whether the sidebar is open on desktop at first. Read the `sidebar_state`
   * cookie in your layout and pass it here to keep the state across page loads.
   *
   * @defaultValue true
   */
  defaultOpen?: boolean;

  /** Control the desktop open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DocsLayout({
  tree,
  tabs: layoutTabs,
  children,
  ...props
}: DocsLayoutProps) {
  let tabs: LayoutTab[] = [];
  if (Array.isArray(layoutTabs)) {
    tabs = layoutTabs;
  } else if (typeof layoutTabs === "object") {
    tabs = getLayoutTabs(tree, layoutTabs);
  } else if (layoutTabs !== false) {
    tabs = getLayoutTabs(tree);
  }

  return (
    <LayoutBody tree={tree} tabs={tabs} {...props}>
      {children}
    </LayoutBody>
  );
}

export { useDocsLayout } from "./client";
