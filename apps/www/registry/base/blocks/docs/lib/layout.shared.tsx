// Adapted from the create-fumadocs-app template (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import type { BaseLayoutProps } from "@/registry/base/docs/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: "My App",
    },
  };
}
