// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useTranslations } from "@fuma-translate/react";
import type { ComponentProps } from "react";
import {
  SidebarRail as SidebarRailPrimitive,
  SidebarTrigger as SidebarTriggerPrimitive,
  useSidebar,
} from "@/components/ui/sidebar";

/**
 * The label for a button that toggles the sidebar, using Fumadocs UI's
 * translation keys (shadcn/ui's sidebar labels it "Toggle Sidebar" in English).
 */
function useToggleLabel() {
  const { isMobile, open, openMobile } = useSidebar();
  const t = useTranslations({ note: "sidebar" });

  if (isMobile ? !openMobile : !open)
    return t("Open Sidebar", { note: "aria-label" });
  return isMobile
    ? t("Close Sidebar", { note: "aria-label" })
    : t("Collapse Sidebar", { note: "aria-label" });
}

/**
 * shadcn/ui's `SidebarTrigger`, with a translated label.
 */
export function SidebarTrigger(
  props: ComponentProps<typeof SidebarTriggerPrimitive>,
) {
  return <SidebarTriggerPrimitive aria-label={useToggleLabel()} {...props} />;
}

/**
 * shadcn/ui's `SidebarRail`, with a translated label.
 */
export function SidebarRail(
  props: ComponentProps<typeof SidebarRailPrimitive>,
) {
  const label = useToggleLabel();

  return <SidebarRailPrimitive aria-label={label} title={label} {...props} />;
}
