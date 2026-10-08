// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import { Languages } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { SidebarRail, SidebarTrigger } from "../../../components/sidebar/base";
import { SidebarLinkItem } from "../../../components/sidebar/link-item";
import {
  SidebarPageTree,
  type SidebarPageTreeComponents,
} from "../../../components/sidebar/page-tree";
import { SidebarTabsDropdown } from "../../../components/sidebar/tabs/dropdown";
import { useI18n } from "../../../contexts/i18n";
import { LinkItem, NavTitle } from "../../shared/client";
import { LanguageSelect } from "../../shared/slots/language-select";
import { ThemeSwitch } from "../../shared/slots/theme-switch";
import { useNotebookLayout } from "../client";

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
    props: { tabs, nav, tabMode, themeSwitch },
  } = useNotebookLayout();
  const navMode = nav?.mode ?? "auto";
  const iconLinks = menuItems.filter((item) => item.type === "icon");
  const links = menuItems.filter((item) => item.type !== "icon");
  const { enabled: themeSwitchEnabled = true, ...themeSwitchProps } =
    themeSwitch ?? {};
  const { locales = [] } = useI18n();
  const languageSelect = locales.length > 1;
  // the navbar shows links from `lg`, and the language and theme switches
  // from `md`
  const footerItemsHidden = iconLinks.length > 0 ? "lg:hidden" : "md:hidden";

  return (
    <SidebarRoot
      collapsible="offcanvas"
      className={cn(
        "text-sm",
        navMode === "top"
          ? // below the navbar, on the page's background
            "top-[calc(var(--docs-banner-height,0px)+var(--docs-header-height))] h-[calc(100svh-var(--docs-banner-height,0px)-var(--docs-header-height))] *:data-[sidebar=sidebar]:bg-background"
          : // below a Banner, if there is one
            "top-(--docs-banner-height,0px) h-[calc(100svh-var(--docs-banner-height,0px))]",
        className,
      )}
      {...rest}
    >
      <SidebarHeader className="gap-3 p-4 pb-2 empty:hidden">
        {navMode === "auto" && (
          <div className="flex items-center gap-2">
            <NavTitle
              nav={nav}
              className="ms-2 me-auto inline-flex items-center gap-2.5 text-[0.9375rem] font-medium"
            />
            {nav?.children}
            {collapsible && (
              <SidebarTrigger className="-me-1.5 text-muted-foreground max-md:hidden" />
            )}
          </div>
        )}
        {tabs.length > 0 && (
          <SidebarTabsDropdown
            options={tabs}
            className={cn(tabMode === "navbar" && "lg:hidden")}
          />
        )}
        {banner}
      </SidebarHeader>
      <SidebarContent className="[scrollbar-width:thin] gap-0 px-2">
        {links.length > 0 && (
          // shown in the navbar on desktop
          <SidebarGroup className="lg:hidden">
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
      {(iconLinks.length > 0 ||
        languageSelect ||
        themeSwitchEnabled ||
        footer) && (
        <SidebarFooter className={cn("p-4 pt-2", !footer && footerItemsHidden)}>
          {(iconLinks.length > 0 || languageSelect || themeSwitchEnabled) && (
            <div
              className={cn(
                "flex items-center text-muted-foreground",
                footerItemsHidden,
              )}
            >
              {iconLinks.map((item, i) => (
                <LinkItem
                  key={i}
                  item={item}
                  className={cn(
                    buttonVariants({ size: "icon-sm", variant: "ghost" }),
                    "lg:hidden [&_svg]:size-4",
                  )}
                  aria-label={item.label}
                >
                  {item.icon}
                </LinkItem>
              ))}
              {languageSelect && (
                <LanguageSelect className="ms-auto md:hidden">
                  <Languages />
                </LanguageSelect>
              )}
              {themeSwitchEnabled && (
                <ThemeSwitch
                  {...themeSwitchProps}
                  className={cn(
                    "md:hidden",
                    !languageSelect && "ms-auto",
                    themeSwitchProps.className,
                  )}
                />
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
