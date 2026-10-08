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
        "mx-auto flex w-full max-w-[900px] min-w-0 flex-col gap-4 px-4 py-6 md:px-6 md:pt-[calc(--spacing(8)+var(--docs-page-offset,0px))] xl:px-8 xl:pt-14",
        full && "max-w-[1168px]",
        props.className,
      )}
    >
      {props.children}
    </article>
  );
}
