// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";
import { SidebarInset } from "@/components/ui/sidebar";

/**
 * The area beside the sidebar. It sets `--docs-header-height`, the height of the
 * mobile navbar, which pages use to offset sticky elements.
 */
export function Container({
  navEnabled = true,
  className,
  ...props
}: ComponentProps<"main"> & { navEnabled?: boolean }) {
  return (
    <SidebarInset
      id="nd-docs-layout"
      {...props}
      className={cn(
        "min-w-0 [--docs-header-height:0px]",
        navEnabled && "max-md:[--docs-header-height:--spacing(14)]",
        className,
      )}
    />
  );
}
