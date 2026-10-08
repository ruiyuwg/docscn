// Adapted from the create-fumadocs-app template (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import type { MDXComponents } from "mdx/types";
import { Accordion, Accordions } from "@/components/docs/components/accordion";
import { File, Files, Folder } from "@/components/docs/components/files";
import { Step, Steps } from "@/components/docs/components/steps";
import { Tab, Tabs } from "@/components/docs/components/tabs";
import { TypeTable } from "@/components/docs/components/type-table";
import defaultMdxComponents from "@/registry/base/docs/mdx";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tabs,
    Tab,
    Steps,
    Step,
    Accordions,
    Accordion,
    Files,
    Folder,
    File,
    TypeTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
