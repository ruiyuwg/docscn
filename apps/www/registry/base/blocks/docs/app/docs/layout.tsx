// Adapted from the create-fumadocs-app template (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import { DocsLayout } from "@/registry/base/docs/layouts/docs";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
