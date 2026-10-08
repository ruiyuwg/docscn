import { highlight, type HighlightOptions } from "fumadocs-core/highlight";
import type { HTMLAttributes, ReactNode } from "react";
import {
  CodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Pre,
} from "@/registry/base/docs/components/codeblock";

type Transformer = NonNullable<HighlightOptions["transformers"]>[number];

/** Marks lines as added or removed, like Shiki's `[!code ++]` notation. */
function diffLines(diff: { add?: number[]; remove?: number[] }): Transformer {
  return {
    name: "diff-lines",
    line(node, line) {
      if (diff.add?.includes(line)) this.addClassToHast(node, "diff add");
      if (diff.remove?.includes(line)) this.addClassToHast(node, "diff remove");
    },
  };
}

/**
 * Code highlighted on the server with Fumadocs Core's Shiki, in the same
 * CodeBlock that renders Fumadocs MDX's code blocks.
 */
export async function Code({
  code,
  lang,
  title,
  icon,
  diff,
  className,
}: {
  code: string;
  lang: string;
  title?: string;
  icon?: ReactNode;
  diff?: { add?: number[]; remove?: number[] };
  className?: string;
}) {
  return highlight(code.trim(), {
    lang,
    transformers: diff ? [diffLines(diff)] : undefined,
    components: {
      pre: (props: HTMLAttributes<HTMLPreElement>) => (
        <CodeBlock
          {...props}
          title={title}
          icon={icon}
          className={className ?? "my-0"}
        >
          <Pre>{props.children}</Pre>
        </CodeBlock>
      ),
    },
  });
}

const packageManagers = [
  { name: "npm", run: "npx" },
  { name: "pnpm", run: "pnpm dlx" },
  { name: "yarn", run: "yarn dlx" },
  { name: "bun", run: "bunx --bun" },
];

/** A command for each package manager, like Fumadocs MDX's `remark-npm`. */
export function PackageCommand({
  command,
  className,
}: {
  /** The command without the runner, e.g. `shadcn@latest add @docscn/docs`. */
  command: string;
  className?: string;
}) {
  return (
    <CodeBlockTabs
      groupId="package-manager"
      persist
      defaultValue="npm"
      className={className}
    >
      <CodeBlockTabsList>
        {packageManagers.map((pm) => (
          <CodeBlockTabsTrigger key={pm.name} value={pm.name}>
            {pm.name}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>
      {packageManagers.map((pm) => (
        <CodeBlockTab key={pm.name} value={pm.name}>
          <Code code={`${pm.run} ${command}`} lang="bash" />
        </CodeBlockTab>
      ))}
    </CodeBlockTabs>
  );
}
