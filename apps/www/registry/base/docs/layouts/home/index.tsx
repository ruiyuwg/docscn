// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { type ComponentProps, createContext, use } from "react";
import {
  type BaseLayoutProps,
  type LinkItemType,
  type NavOptions,
  useLinkItems,
} from "../shared";
import { Container } from "./slots/container";
import { Header } from "./slots/header";

export interface HomeLayoutProps
  extends BaseLayoutProps, Omit<ComponentProps<"main">, "children"> {
  nav?: Nav;
}

interface Nav extends NavOptions {
  /**
   * Open mobile menu when hovering the trigger
   */
  enableHoverToOpen?: boolean;
}

const LayoutContext = createContext<{
  props: Pick<HomeLayoutProps, "nav" | "themeSwitch" | "searchToggle">;
  navItems: LinkItemType[];
  menuItems: LinkItemType[];
} | null>(null);

export function useHomeLayout() {
  const context = use(LayoutContext);
  if (!context)
    throw new Error(
      "Please use this component under <HomeLayout /> (`components/docs/layouts/home`).",
    );
  return context;
}

export function HomeLayout(props: HomeLayoutProps) {
  const {
    nav,
    children,
    githubUrl,
    links,
    themeSwitch,
    searchToggle,
    ...rest
  } = props;
  const linkItems = useLinkItems({ githubUrl, links });

  return (
    <LayoutContext
      value={{
        props: { nav, themeSwitch, searchToggle },
        ...linkItems,
      }}
    >
      <Container {...rest}>
        {(nav?.enabled ?? true) && <Header />}
        {children}
      </Container>
    </LayoutContext>
  );
}
