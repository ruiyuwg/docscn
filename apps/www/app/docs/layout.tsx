import Link from "next/link";
import type * as PageTree from "fumadocs-core/page-tree";
import { source } from "@/lib/source";

// Temporary layout until docscn's docs layout and sidebar replace it.
export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-12 px-4 py-10">
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="sticky top-10 text-sm">
          <PageTreeNodes nodes={source.getPageTree().children} />
        </nav>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function PageTreeNodes({ nodes }: { nodes: PageTree.Node[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {nodes.map((node, i) => (
        <li key={node.$id ?? i}>
          {node.type === "page" && (
            <Link
              href={node.url}
              className="text-muted-foreground hover:text-foreground"
            >
              {node.name}
            </Link>
          )}
          {node.type === "separator" && (
            <p className="mt-4 font-medium">{node.name}</p>
          )}
          {node.type === "folder" && (
            <>
              <p className="mt-4 font-medium">{node.name}</p>
              <PageTreeNodes nodes={node.children} />
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
