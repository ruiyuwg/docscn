// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import type { ComponentProps } from "react";
import { toJsx } from "fumadocs-core/utils/hast-to-jsx";
import { CodeBlock, type CodeBlockProps, Pre } from "./codeblock";
import {
  highlight,
  type Highlighter,
  type HighlightOptions,
} from "fumadocs-core/highlight";
import { cn } from "cn";

export type ServerCodeBlockProps = HighlightOptions & {
  code: string;

  /**
   * Extra props for the underlying `<CodeBlock />` component.
   *
   * Ignored if you defined your own `pre` component in `components`.
   */
  codeblock?: CodeBlockProps;
};

export async function ServerCodeBlock({
  code,
  codeblock,
  ...options
}: ServerCodeBlockProps) {
  return await highlight(code, {
    defaultColor: false,
    ...options,
    components: {
      pre: createPre(codeblock),
      ...options.components,
    },
  });
}

/**
 * Create a server code block that highlights with your own highlighter.
 */
export function createServerCodeBlock({
  highlighter,
}: {
  highlighter: Highlighter;
}) {
  return async function ServerCodeBlock({
    code,
    lang,
    codeblock,
  }: Pick<ServerCodeBlockProps, "code" | "lang" | "codeblock">) {
    await highlighter.loadLanguage?.(lang);

    return toJsx(highlighter.codeToHast(code, { lang }), {
      components: { pre: createPre(codeblock) },
    });
  };
}

function createPre(codeblock?: CodeBlockProps) {
  return function ServerPre(props: ComponentProps<"pre">) {
    return (
      <CodeBlock
        {...props}
        {...codeblock}
        className={cn("my-0", props.className, codeblock?.className)}
      >
        <Pre>{props.children}</Pre>
      </CodeBlock>
    );
  };
}
