// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import { cn } from "cn";
import { Image as FrameworkImage } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import type { LoaderConfig, LoaderOutput, Page } from "fumadocs-core/source";
import type * as React from "react";
import type {
  AnchorHTMLAttributes,
  ComponentProps,
  FC,
  HTMLAttributes,
  ImgHTMLAttributes,
  TableHTMLAttributes,
} from "react";
import { Card, Cards } from "./components/card";
import {
  Callout,
  CalloutContainer,
  CalloutDescription,
  CalloutTitle,
} from "./components/callout";
import {
  CodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Pre,
} from "./components/codeblock";
import { Heading } from "./components/heading";

/**
 * global types for MDX.js
 */
declare module "mdx/types.js" {
  // Augment the MDX types to make it understand React.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    type ElementType = React.JSX.ElementType;
    type IntrinsicElements = React.JSX.IntrinsicElements;
  }
}

function Image(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <FrameworkImage
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
      {...(props as ComponentProps<typeof FrameworkImage>)}
      className={cn("rounded-lg", props.className)}
    />
  );
}

function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative my-6 overflow-auto *:my-0">
      <table {...props} />
    </div>
  );
}

const defaultMdxComponents = {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <CodeBlock {...props}>
      <Pre>{props.children}</Pre>
    </CodeBlock>
  ),
  Card,
  Cards,
  a: Link as FC<AnchorHTMLAttributes<HTMLAnchorElement>>,
  img: Image,
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h1" {...props} />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h2" {...props} />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h3" {...props} />
  ),
  h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h4" {...props} />
  ),
  h5: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h5" {...props} />
  ),
  h6: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as="h6" {...props} />
  ),
  table: Table,
  Callout,
  CalloutContainer,
  CalloutTitle,
  CalloutDescription,
};

/**
 * Extend the default Link component to resolve relative file paths in `href`.
 *
 * Only works in server components.
 *
 * @param page the current page
 * @param source the source object
 * @param OverrideLink The component to override from
 */
export function createRelativeLink<C extends LoaderConfig>(
  source: LoaderOutput<C>,
  page: Page | C["page"],
  OverrideLink: FC<ComponentProps<"a">> = defaultMdxComponents.a,
): FC<ComponentProps<"a">> {
  return async function RelativeLink({ href, ...props }) {
    return (
      <OverrideLink
        href={href ? source.resolveHref(href, page) : href}
        {...props}
      />
    );
  };
}

export { defaultMdxComponents, defaultMdxComponents as default };
