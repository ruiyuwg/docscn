// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import {
  type BreadcrumbOptions,
  getBreadcrumbItemsFromPath,
} from "fumadocs-core/breadcrumb";
import Link from "fumadocs-core/link";
import { type ComponentProps, Fragment, useMemo } from "react";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as BreadcrumbRoot,
} from "@/components/ui/breadcrumb";
import { useTreeContext, useTreePath } from "../../../../contexts/tree";

export type BreadcrumbProps = BreadcrumbOptions & ComponentProps<"nav">;

export function Breadcrumb({
  includeRoot,
  includeSeparator,
  includePage,
  ...props
}: BreadcrumbProps) {
  const path = useTreePath();
  const { root } = useTreeContext();
  const items = useMemo(() => {
    return getBreadcrumbItemsFromPath(root, path, {
      includePage,
      includeSeparator,
      includeRoot,
    });
  }, [includePage, includeRoot, includeSeparator, path, root]);

  if (items.length === 0) return null;

  return (
    <BreadcrumbRoot {...props}>
      <BreadcrumbList>
        {items.map((item, i) => {
          const last = i === items.length - 1;

          return (
            <Fragment key={i}>
              {i !== 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                {item.url && !last ? (
                  <BreadcrumbLink
                    className="truncate"
                    render={<Link href={item.url} />}
                  >
                    {item.name}
                  </BreadcrumbLink>
                ) : last ? (
                  <BreadcrumbPage className="truncate">
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <span className="truncate">{item.name}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
