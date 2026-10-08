// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import { ChevronDown, Languages } from "lucide-react";
import {
  type ComponentProps,
  Fragment,
  type HTMLAttributes,
  useMemo,
} from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarTrigger } from "../../../components/sidebar/base";
import { SidebarTabsDropdown } from "../../../components/sidebar/tabs/dropdown";
import { useI18n } from "../../../contexts/i18n";
import { useTabsGroups, useTreePath } from "../../../contexts/tree";
import { findLast, findLastIndex } from "../../../utils/array";
import {
  isLayoutTabActive,
  isLinkItemActive,
  type LayoutTab,
  type LinkItemType,
  type MenuItemType,
} from "../../shared";
import { LinkItem, NavTitle } from "../../shared/client";
import { LanguageSelect } from "../../shared/slots/language-select";
import {
  FullSearchTrigger,
  SearchTrigger,
} from "../../shared/slots/search-trigger";
import { ThemeSwitch } from "../../shared/slots/theme-switch";
import { useNotebookLayout } from "../client";

/**
 * The navbar, with the title, search, links, the theme switch and the sidebar
 * trigger, plus the layout tabs on desktop when `tabMode` is `navbar`.
 */
export function Header(props: ComponentProps<"header">) {
  const {
    navItems,
    isNavTransparent,
    props: {
      tabMode,
      nav,
      tabs,
      themeSwitch,
      searchToggle,
      sidebarCollapsible,
    },
  } = useNotebookLayout();
  const { state, openMobile } = useSidebar();
  const { locales = [] } = useI18n();
  const navMode = nav?.mode ?? "auto";
  const collapsed = state === "collapsed";
  const groups = useTabsGroups(tabs);
  const showLayoutTabs = tabMode === "navbar" && groups.length > 0;
  const { enabled: themeSwitchEnabled = true, ...themeSwitchProps } =
    themeSwitch ?? {};
  const {
    enabled: searchEnabled = true,
    sm: searchSmProps,
    full: searchFullProps,
  } = searchToggle ?? {};

  return (
    <header
      id="nd-subnav"
      data-transparent={isNavTransparent && !openMobile}
      {...props}
      className={cn(
        "sticky top-(--docs-banner-height,0px) z-30 flex flex-col backdrop-blur-sm transition-colors data-[transparent=false]:bg-background/80",
        props.className,
      )}
    >
      <div
        data-header-body=""
        className={cn(
          "flex h-14 gap-2 border-b px-4",
          navMode === "top" && "md:px-6",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            navMode === "top" && "flex-1",
            // beside an open sidebar, which shows the title instead
            navMode === "auto" && !collapsed && "md:hidden",
          )}
        >
          {sidebarCollapsible && navMode === "auto" && (
            <SidebarTrigger className="-ms-1.5 text-muted-foreground max-md:hidden" />
          )}
          <NavTitle
            nav={nav}
            className="inline-flex items-center gap-2.5 font-semibold"
          />
          {nav?.children}
        </div>
        {searchEnabled && (
          <FullSearchTrigger
            hideIfDisabled
            {...searchFullProps}
            className={cn(
              "my-auto w-full max-md:hidden",
              navMode === "top" ? "max-w-sm" : "max-w-[240px]",
              searchFullProps?.className,
            )}
          />
        )}
        <div className="flex flex-1 items-center justify-end md:gap-2">
          <div className="flex items-center gap-6 empty:hidden max-lg:hidden">
            {navItems
              .filter((item) => item.type !== "icon")
              .map((item, i) => (
                <NavbarLinkItem key={i} item={item} />
              ))}
          </div>
          {navItems
            .filter((item) => item.type === "icon")
            .map((item, i) => (
              <LinkItem
                key={i}
                item={item}
                className={cn(
                  buttonVariants({ size: "icon-sm", variant: "ghost" }),
                  "text-muted-foreground max-lg:hidden [&_svg]:size-4",
                )}
                aria-label={item.label}
              >
                {item.icon}
              </LinkItem>
            ))}

          <div className="flex items-center md:hidden">
            {searchEnabled && (
              <SearchTrigger hideIfDisabled {...searchSmProps} />
            )}
            <SidebarTrigger className="-me-1.5" />
          </div>

          <div className="flex items-center gap-2 max-md:hidden">
            {locales.length > 1 && (
              <LanguageSelect className="text-muted-foreground">
                <Languages />
              </LanguageSelect>
            )}
            {themeSwitchEnabled && <ThemeSwitch {...themeSwitchProps} />}
            {sidebarCollapsible && navMode === "top" && (
              <SidebarTrigger className="-me-1.5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
      {showLayoutTabs && (
        <LayoutHeaderTabs
          data-header-tabs=""
          className="h-10 overflow-x-auto border-b px-6 max-lg:hidden"
          tabs={tabs}
        />
      )}
    </header>
  );
}

function LayoutHeaderTabs({
  tabs: allTabs,
  className,
  ...props
}: ComponentProps<"div"> & {
  tabs: LayoutTab[];
}) {
  const pathname = usePathname();
  const path = useTreePath();
  const tabs = findLast(
    useTabsGroups(allTabs),
    (group) => typeof group.active?.root !== "string",
  )?.options;
  // tabs of typed root folders, which switch between themselves
  const typedTabs = useMemo(() => {
    return allTabs.filter((tab) => typeof tab.$folder?.root === "string");
  }, [allTabs]);
  const selectedIdx = useMemo(() => {
    if (!tabs) return -1;
    return findLastIndex(tabs, (option) =>
      isLayoutTabActive(option, path, pathname),
    );
  }, [tabs, path, pathname]);

  return (
    <div className={cn("flex flex-row items-end gap-6", className)} {...props}>
      {typedTabs.length > 0 && (
        <SidebarTabsDropdown
          options={typedTabs}
          className="my-auto w-auto p-1"
        />
      )}
      {tabs?.map((option, i) => {
        const {
          title,
          url,
          unlisted,
          props: { className, ...rest } = {},
        } = option;
        const isSelected = selectedIdx === i;

        return (
          <Link
            key={i}
            href={url}
            className={cn(
              "inline-flex items-center gap-2 border-b-2 border-transparent pb-1.5 text-sm font-medium text-nowrap text-muted-foreground transition-colors hover:text-foreground",
              unlisted && !isSelected && "hidden",
              isSelected && "border-primary text-foreground",
              className,
            )}
            {...rest}
          >
            {title}
          </Link>
        );
      })}
    </div>
  );
}

function NavbarLinkItem({
  item,
  className,
  ...props
}: { item: LinkItemType } & HTMLAttributes<HTMLElement>) {
  if (item.type === "custom") return item.children;

  if (item.type === "menu") {
    return <NavbarLinkItemMenu item={item} className={className} {...props} />;
  }

  return (
    <LinkItem
      item={item}
      className={cn(
        "text-sm text-muted-foreground transition-colors hover:text-foreground data-[active=true]:text-foreground",
        className,
      )}
      {...props}
    >
      {item.text}
    </LinkItem>
  );
}

function NavbarLinkItemMenu({
  item,
  className,
  ...props
}: { item: MenuItemType } & HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const active = item.items.some((child) => isLinkItemActive(child, pathname));

  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={50}
        // a menu with a url is also a link
        {...(item.url && {
          nativeButton: false,
          render: <Link href={item.url} external={item.external} />,
        })}
        data-active={active || isLinkItemActive(item, pathname)}
        className={cn(
          "inline-flex items-center gap-1.5 p-1 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:text-foreground data-[active=true]:text-foreground",
          className,
        )}
        {...props}
      >
        {item.text}
        <ChevronDown className="size-3" />
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-40 gap-0 p-1 text-start text-muted-foreground">
        {item.items.map((child, i) => {
          if (child.type === "custom")
            return <Fragment key={i}>{child.children}</Fragment>;

          return (
            <LinkItem
              key={i}
              item={child}
              className="inline-flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:text-foreground [&_svg]:size-4"
            >
              {child.icon}
              {child.text}
            </LinkItem>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
