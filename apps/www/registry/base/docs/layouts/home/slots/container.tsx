// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import type { ComponentProps } from "react";
import { cn } from "cn";

export function Container(props: ComponentProps<"main">) {
  return (
    <main
      id="nd-home-layout"
      {...props}
      className={cn("flex flex-1 flex-col", props.className)}
    />
  );
}
