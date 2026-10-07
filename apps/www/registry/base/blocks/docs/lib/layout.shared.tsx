import type { BaseLayoutProps } from "@/registry/base/docs/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: "My App",
    },
  };
}
