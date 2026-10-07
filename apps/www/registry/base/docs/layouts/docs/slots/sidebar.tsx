// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarLinkItem } from "../../../components/sidebar/link-item";
import {
  SidebarPageTree,
  type SidebarPageTreeComponents,
} from "../../../components/sidebar/page-tree";
import { SidebarTabsDropdown } from "../../../components/sidebar/tabs/dropdown";
import { LinkItem, NavTitle } from "../../shared/client";
import { FullSearchTrigger } from "../../shared/slots/search-trigger";
import { ThemeSwitch } from "../../shared/slots/theme-switch";
import { useDocsLayout } from "../client";

export interface SidebarProps extends Omit<
  ComponentProps<typeof SidebarRoot>,
  "collapsible"
> {
  components?: Partial<SidebarPageTreeComponents>;
  banner?: ReactNode;
  footer?: ReactNode;

  /**
   * Support collapsing the sidebar on desktop mode
   *
   * @defaultValue true
   */
  collapsible?: boolean;
}

export function Sidebar({
  footer,
  banner,
  collapsible = true,
  components,
  className,
  ...rest
}: SidebarProps) {
  const {
    menuItems,
    props: { tabs, nav, tabMode, themeSwitch, searchToggle },
  } = useDocsLayout();
  const iconLinks = menuItems.filter((item) => item.type === "icon");
  const links = menuItems.filter((item) => item.type !== "icon");
  const { enabled: themeSwitchEnabled = true, ...themeSwitchProps } =
    themeSwitch ?? {};
  const { enabled: searchEnabled = true, full: searchProps } =
    searchToggle ?? {};

  return (
    <SidebarRoot
      collapsible="offcanvas"
      className={cn("text-sm", className)}
      {...rest}
    >
      <SidebarHeader className="gap-3 p-4 pb-2">
        <div className="flex items-center gap-2">
          <NavTitle
            nav={nav}
            className="me-auto inline-flex items-center gap-2.5 text-[0.9375rem] font-medium"
          />
          {nav?.children}
          {collapsible && (
            <SidebarTrigger className="-me-1.5 text-muted-foreground max-md:hidden" />
          )}
        </div>
        {searchEnabled && <FullSearchTrigger hideIfDisabled {...searchProps} />}
        {tabs.length > 0 && (
          <SidebarTabsDropdown
            options={
              tabMode === "auto"
                ? tabs
                : tabs.filter((tab) => typeof tab.$folder?.root === "string")
            }
          />
        )}
        {banner}
      </SidebarHeader>
      <SidebarContent className="[scrollbar-width:thin] gap-0 px-2">
        {links.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((item, i) => (
                  <SidebarLinkItem key={i} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarPageTree {...components} />
      </SidebarContent>
      {(iconLinks.length > 0 || themeSwitchEnabled || footer) && (
        <SidebarFooter className="p-4 pt-2">
          {(iconLinks.length > 0 || themeSwitchEnabled) && (
            <div className="flex items-center text-muted-foreground">
              {iconLinks.map((item, i) => (
                <LinkItem
                  key={i}
                  item={item}
                  className={cn(
                    buttonVariants({ size: "icon-sm", variant: "ghost" }),
                    "[&_svg]:size-4",
                  )}
                  aria-label={item.label}
                >
                  {item.icon}
                </LinkItem>
              ))}
              {themeSwitchEnabled && (
                <ThemeSwitch className="ms-auto" {...themeSwitchProps} />
              )}
            </div>
          )}
          {footer}
        </SidebarFooter>
      )}
      {collapsible && <SidebarRail />}
    </SidebarRoot>
  );
}
