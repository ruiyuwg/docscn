// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";

/**
 * Wraps the navbar, sidebar and page. It sets `--docs-header-height`, the
 * height of the navbar (taller with layout tabs below it), which the sidebar
 * and pages use to offset sticky elements.
 */
export function Container({
  navEnabled = true,
  className,
  ...props
}: ComponentProps<"div"> & {
  navEnabled?: boolean;
}) {
  return (
    <div
      id="nd-notebook-layout"
      {...props}
      className={cn(
        "flex w-full min-w-0 flex-col [--docs-header-height:0px]",
        navEnabled &&
          "[--docs-header-height:--spacing(14)] lg:has-data-header-tabs:[--docs-header-height:--spacing(24)]",
        className,
      )}
    />
  );
}
