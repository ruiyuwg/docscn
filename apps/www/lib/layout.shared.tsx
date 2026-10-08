import { Logo } from "@/components/logo";
import type { BaseLayoutProps } from "@/registry/base/docs/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // one element, so its own gap applies instead of the layout's
      title: (
        <span className="inline-flex items-center gap-1.5">
          <Logo className="size-3.5" />
          Docscn
        </span>
      ),
    },
    githubUrl: "https://github.com/ruiyuwg/docscn",
  };
}
