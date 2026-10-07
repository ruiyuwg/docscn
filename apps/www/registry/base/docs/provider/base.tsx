// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { ThemeProvider, type ThemeProviderProps, useTheme } from "next-themes";
import { lazy, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { DefaultSearchDialogProps } from "../components/dialog/search-default";
import { SearchProvider, type SearchProviderProps } from "../contexts/search";
import { useHotKey } from "../utils/hotkey";

const DefaultSearchDialog = lazy(
  () => import("../components/dialog/search-default"),
);

interface SearchOptions extends Omit<
  SearchProviderProps<DefaultSearchDialogProps>,
  "children"
> {
  /**
   * Enable search functionality
   *
   * @defaultValue `true`
   */
  enabled?: boolean;
}

interface ThemeOptions extends ThemeProviderProps {
  /**
   * Enable `next-themes`
   *
   * @defaultValue true
   */
  enabled?: boolean;

  /**
   * Hotkey for toggling between light/dark mode, pass `false` to disable it.
   *
   * It is ignored while typing in an editable element (e.g. `<input />`), or when a dialog is opened.
   *
   * @defaultValue `d`
   */
  hotKey?: string | ((e: KeyboardEvent) => boolean) | false;
}

export interface RootProviderProps {
  /**
   * `dir` option for Base UI
   */
  dir?: "rtl" | "ltr";

  /**
   * @remarks `SearchProviderProps`
   */
  search?: Partial<SearchOptions>;

  /**
   * Customize options for `next-themes`
   */
  theme?: ThemeOptions;

  children?: ReactNode;
}

/**
 * Toggle between light/dark mode with a hotkey, must be placed under `next-themes` provider.
 */
function ThemeHotKey({
  hotKey,
}: {
  hotKey: Exclude<ThemeOptions["hotKey"], false | undefined>;
}) {
  const { setTheme, resolvedTheme } = useTheme();

  useHotKey(
    (e) => {
      // a custom function is responsible for its own modifiers
      const matched =
        typeof hotKey === "string"
          ? !e.metaKey &&
            !e.ctrlKey &&
            !e.altKey &&
            e.key.toLowerCase() === hotKey.toLowerCase()
          : hotKey(e);
      if (!matched) return;

      e.preventDefault();
      const next = resolvedTheme === "dark" ? "light" : "dark";
      if (document?.startViewTransition) {
        document.startViewTransition(() => flushSync(() => setTheme(next)));
      } else {
        setTheme(next);
      }
    },
    { ignoreTyping: true },
  );

  return null;
}

export function RootProvider({
  children,
  dir = "ltr",
  theme = {},
  search,
}: RootProviderProps) {
  let body = children;

  if (search?.enabled !== false) {
    body = (
      <SearchProvider SearchDialog={DefaultSearchDialog} {...search}>
        {body}
      </SearchProvider>
    );
  }

  if (theme?.enabled !== false) {
    const { hotKey = "d" } = theme;

    body = (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        {...theme}
      >
        {hotKey !== false && <ThemeHotKey hotKey={hotKey} />}
        {body}
      </ThemeProvider>
    );
  }

  return (
    <DirectionProvider direction={dir}>
      <TooltipProvider>{body}</TooltipProvider>
    </DirectionProvider>
  );
}

export {
  /**
   * re-exported from `next-themes`
   */
  useTheme,
  type UseThemeProps,
} from "next-themes";
