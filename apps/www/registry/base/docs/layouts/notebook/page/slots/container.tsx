// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";
import { useDocsPage } from "..";

export function Container(props: ComponentProps<"article">) {
  const { full } = useDocsPage();

  return (
    <article
      id="nd-page"
      data-layout-content=""
      data-full={full}
      {...props}
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col gap-4 px-4 py-6 *:max-w-[900px] md:px-6 md:pt-8 xl:px-8 xl:pt-14",
        full && "*:max-w-[1285px]",
        props.className,
      )}
    >
      {props.children}
    </article>
  );
}
