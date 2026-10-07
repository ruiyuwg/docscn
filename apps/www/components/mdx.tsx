import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";

// Minimal element styles for the docs site until docscn has its own typography.
export function getMDXComponents(components?: MDXComponents) {
  return {
    h2: (props) => (
      <h2
        className="mt-10 scroll-m-20 text-xl font-semibold tracking-tight"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="mt-8 scroll-m-20 text-lg font-semibold tracking-tight"
        {...props}
      />
    ),
    p: (props) => <p className="leading-7 not-first:mt-4" {...props} />,
    a: ({ href = "", ...props }) => (
      <Link
        href={href}
        className="font-medium underline underline-offset-4"
        {...props}
      />
    ),
    ul: (props) => <ul className="mt-4 ml-6 list-disc" {...props} />,
    ol: (props) => <ol className="mt-4 ml-6 list-decimal" {...props} />,
    li: (props) => <li className="mt-2" {...props} />,
    code: (props) => (
      <code
        className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm"
        {...props}
      />
    ),
    pre: ({ icon, ...props }: ComponentProps<"pre"> & { icon?: string }) => (
      <pre
        className="mt-4 overflow-x-auto rounded-lg border p-4 text-sm [&_code]:bg-transparent [&_code]:p-0"
        {...props}
      />
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
