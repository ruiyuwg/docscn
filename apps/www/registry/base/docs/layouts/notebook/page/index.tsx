// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import type { TOCItemType } from "fumadocs-core/toc";
import { Edit } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  use,
  useSyncExternalStore,
} from "react";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumb, type BreadcrumbProps } from "./slots/breadcrumb";
import { Container } from "./slots/container";
import { Footer, type FooterProps } from "./slots/footer";
import {
  TOC,
  TOCPopover,
  type TOCPopoverProps,
  type TOCProps,
  TOCProvider,
  type TOCProviderProps,
} from "./slots/toc";

export interface DocsPageProps extends ComponentProps<"article"> {
  toc?: TOCItemType[];

  /**
   * Extend the page to fill all available space
   *
   * @defaultValue false
   */
  full?: boolean | undefined;

  footer?: FooterOptions;
  breadcrumb?: BreadcrumbOptions;
  tableOfContent?: TableOfContentOptions;
  tableOfContentPopover?: TableOfContentPopoverOptions;
}

interface BreadcrumbOptions extends BreadcrumbProps {
  enabled?: boolean;
}

interface FooterOptions extends FooterProps {
  enabled?: boolean;
}

type TableOfContentOptions = Pick<TOCProviderProps, "single"> &
  TOCProps & {
    enabled?: boolean;
  };

type TableOfContentPopoverOptions = TOCPopoverProps & {
  enabled?: boolean;
};

const PageContext = createContext<{
  full: NonNullable<DocsPageProps["full"]>;
} | null>(null);

export function useDocsPage() {
  const context = use(PageContext);
  if (!context)
    throw new Error(
      "Please use page components under <DocsPage /> (`components/docs/layouts/notebook/page`).",
    );
  return context;
}

export function DocsPage({
  full = false,
  tableOfContent: { enabled: tocEnabled = !full, single, ...tocProps } = {},
  tableOfContentPopover: {
    enabled: tocPopoverEnabled,
    ...tocPopoverProps
  } = {},
  breadcrumb: { enabled: breadcrumbEnabled = true, ...breadcrumb } = {},
  footer: { enabled: footerEnabled = true, ...footer } = {},
  toc = [],
  children,
  ...containerProps
}: DocsPageProps) {
  tocPopoverEnabled ??= Boolean(
    toc.length > 0 || tocPopoverProps.header || tocPopoverProps.footer,
  );

  return (
    <PageContext value={{ full }}>
      <TOCProvider
        single={single}
        toc={tocEnabled || tocPopoverEnabled ? toc : []}
      >
        {tocPopoverEnabled && <TOCPopover {...tocPopoverProps} />}
        <div
          data-docs-page=""
          className={cn("flex w-full flex-1", tocEnabled && "max-w-[1284px]")}
        >
          <Container {...containerProps}>
            {breadcrumbEnabled && <Breadcrumb {...breadcrumb} />}
            {children}
            {footerEnabled && <Footer {...footer} />}
          </Container>
          {tocEnabled && <TOC {...tocProps} />}
        </div>
      </TOCProvider>
    </PageContext>
  );
}

export function EditOnGitHub(props: ComponentProps<"a">) {
  return (
    <a
      target="_blank"
      rel="noreferrer noopener"
      {...props}
      className={cn(
        buttonVariants({
          variant: "secondary",
          size: "sm",
        }),
        "not-docs-typeset gap-1.5",
        props.className,
      )}
    >
      {props.children ?? (
        <>
          <Edit className="size-3.5" />
          Edit on GitHub
        </>
      )}
    </a>
  );
}

/**
 * Add typography styles
 */
export function DocsBody({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div {...props} className={cn("docs-typeset flex-1", className)}>
      {children}
    </div>
  );
}

export function DocsDescription({
  children,
  className,
  ...props
}: ComponentProps<"p">) {
  // Don't render if no description provided
  if (children === undefined) return null;

  return (
    <p
      {...props}
      className={cn("mb-8 text-lg text-muted-foreground", className)}
    >
      {children}
    </p>
  );
}

export function DocsTitle({
  children,
  className,
  ...props
}: ComponentProps<"h1">) {
  return (
    <h1
      {...props}
      className={cn("text-[1.75em] font-semibold tracking-tight", className)}
    >
      {children}
    </h1>
  );
}

const noop = () => () => {};

export function PageLastUpdate({
  date: value,
  ...props
}: Omit<ComponentProps<"p">, "children"> & { date: Date }) {
  // formatted in the reader's locale and timezone, so empty on the server
  const date = useSyncExternalStore(
    noop,
    () => value.toLocaleDateString(),
    () => "",
  );

  return (
    <p
      {...props}
      className={cn("text-sm text-muted-foreground", props.className)}
    >
      Last updated on {date}
    </p>
  );
}

export {
  type BreadcrumbProps,
  Breadcrumb as PageBreadcrumb,
} from "./slots/breadcrumb";
export { type FooterProps, Footer as PageFooter } from "./slots/footer";
export {
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "../../shared/page-actions";
