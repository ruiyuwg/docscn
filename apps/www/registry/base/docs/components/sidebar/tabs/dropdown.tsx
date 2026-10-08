// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import { Check, ChevronsUpDown } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useTabsGroups, useTreePath } from "../../../contexts/tree";
import { isLayoutTabActive, type LayoutTab } from "../../../layouts/shared";

export type SidebarTabWithProps = LayoutTab;

/**
 * Renders the given tabs as a dropdown per tabs group, one for each root folder on the
 * current page's path, letting users switch between root folders of the same type.
 */
export function SidebarTabsDropdown({
  options,
  placeholder,
  ...props
}: {
  placeholder?: ReactNode;
  options: LayoutTab[];
} & ComponentProps<"button">) {
  const groups = useTabsGroups(options);

  return groups.map((group, i) => (
    <Dropdown
      key={i}
      options={group.options}
      placeholder={placeholder}
      {...props}
    />
  ));
}

function Dropdown({
  options,
  placeholder,
  className,
  ...props
}: {
  placeholder?: ReactNode;
  options: LayoutTab[];
} & ComponentProps<"button">) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const path = useTreePath();

  const selected = useMemo(() => {
    return options.findLast((item) => isLayoutTabActive(item, path, pathname));
  }, [options, path, pathname]);

  const item = selected ? (
    <>
      <div className="size-8 shrink-0 empty:hidden md:size-5 [&_svg]:size-full">
        {selected.icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{selected.title}</p>
        <p className="text-sm text-muted-foreground empty:hidden md:hidden">
          {selected.description}
        </p>
      </div>
    </>
  ) : (
    placeholder
  );

  return (
    <DropdownMenu>
      {item && (
        <DropdownMenuTrigger
          {...props}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border bg-background p-2 text-start shadow-xs transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring data-popup-open:bg-sidebar-accent",
            className,
          )}
        >
          {item}
          <ChevronsUpDown className="ms-auto size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent className="w-(--anchor-width) min-w-56">
        {options.map((item) => {
          const isActive = selected && item.url === selected.url;
          if (!isActive && item.unlisted) return;

          return (
            <DropdownMenuItem
              key={item.url}
              className="items-start gap-2 p-1.5"
              render={
                <Link
                  href={item.url}
                  {...item.props}
                  onClick={(e) => {
                    item.props?.onClick?.(e);
                    if (isMobile) setOpenMobile(false);
                  }}
                />
              }
            >
              <div className="size-8 shrink-0 empty:hidden md:size-5 [&_svg]:size-full">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm leading-5 font-medium">{item.title}</p>
                <p className="text-[0.8125rem] text-muted-foreground empty:hidden">
                  {item.description}
                </p>
              </div>
              <Check
                className={cn(
                  "ms-auto mt-0.5 size-3.5 shrink-0",
                  !isActive && "invisible",
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
