import { Logo } from "@/components/logo";
import type { BaseLayoutProps } from "@/registry/base/docs/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Logo className="size-5" />
          docscn
        </>
      ),
    },
    githubUrl: "https://github.com/ruiyuwg/docscn",
  };
}
