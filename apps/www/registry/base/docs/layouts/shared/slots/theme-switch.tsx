// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { Airplay, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { type ComponentProps, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const noop = () => () => {};

export interface ThemeSwitchProps extends ComponentProps<"div"> {
  mode?: "light-dark" | "light-dark-system";
}

function changeTheme(setTheme: (theme: string) => void, theme: string) {
  if (document?.startViewTransition) {
    document.startViewTransition(() => flushSync(() => setTheme(theme)));
  } else {
    setTheme(theme);
  }
}

export function ThemeSwitch({
  className,
  mode = "light-dark",
  ...props
}: ThemeSwitchProps) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  // `false` on the server and during hydration
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  if (mode === "light-dark") {
    const value = mounted ? resolvedTheme : null;

    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={className}
        aria-label="Toggle Theme"
        onClick={() =>
          changeTheme(setTheme, value === "light" ? "dark" : "light")
        }
        data-theme-toggle=""
      >
        <Sun className="dark:hidden" />
        <Moon className="hidden dark:block" />
      </Button>
    );
  }

  const value = mounted ? theme : undefined;

  return (
    <div className={className} data-theme-toggle="" {...props}>
      <ToggleGroup
        size="sm"
        spacing={0}
        value={value ? [value] : []}
        onValueChange={(values) => {
          if (values[0]) changeTheme(setTheme, values[0]);
        }}
      >
        <ToggleGroupItem value="light" aria-label="Light">
          <Sun />
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label="Dark">
          <Moon />
        </ToggleGroupItem>
        <ToggleGroupItem value="system" aria-label="System">
          <Airplay />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
