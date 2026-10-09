// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import type * as PageTree from "fumadocs-core/page-tree";
import type { ComponentProps } from "react";
import type { SidebarTreeOptions } from "../../components/sidebar/page-tree";
import {
  type AIChatOptions,
  type BaseLayoutProps,
  getLayoutTabs,
  type GetLayoutTabsOptions,
  type LayoutTab,
  type NavOptions,
} from "../shared";
import { LayoutBody } from "./client";
import type { SidebarProps } from "./slots/sidebar";

export interface DocsLayoutProps extends Omit<BaseLayoutProps, "nav"> {
  tree: PageTree.Root;
  tabs?: LayoutTab[] | GetLayoutTabsOptions | false;
  /**
   * Show layout tabs as a dropdown in the sidebar, or below the navbar on
   * desktop
   *
   * @defaultValue 'sidebar'
   */
  tabMode?: "sidebar" | "navbar";
  sidebar?: SidebarOptions;
  nav?: NavOptions & {
    /**
     * `top` places the navbar above the sidebar, across the whole width.
     * `auto` places it beside the sidebar.
     *
     * @defaultValue 'auto'
     */
    mode?: "top" | "auto";
  };
  containerProps?: ComponentProps<"div">;
  aiChat?: AIChatOptions;
}

export interface SidebarOptions extends SidebarProps, SidebarTreeOptions {
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

export { useNotebookLayout } from "./client";
