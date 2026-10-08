// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useTranslations } from "@fuma-translate/react";
import { cn } from "cn";
import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import type * as PageTree from "fumadocs-core/page-tree";
import { ChevronRight } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type FC,
  Fragment,
  type ReactNode,
  type RefCallback,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";
import scrollIntoView from "scroll-into-view-if-needed";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTreeContext, useTreePath } from "../../contexts/tree";
import { isActive } from "../../utils/urls";

export interface SidebarPageTreeComponents {
  Item: FC<{ item: PageTree.Item }>;
  Folder: FC<{ item: PageTree.Folder; children: ReactNode }>;
  Separator: FC<{ item: PageTree.Separator }>;
}

export interface SidebarTreeOptions {
  /**
   * Open folders up to this depth by default
   *
   * @defaultValue 0
   */
  defaultOpenLevel?: number;

  /**
   * Prefetch the pages linked from the sidebar
   */
  prefetch?: boolean;
}

const OptionsContext = createContext<SidebarTreeOptions>({});
const DepthContext = createContext(0);

/**
 * Options for the sidebar items below it (`defaultOpenLevel` and `prefetch`).
 */
export function SidebarTreeOptionsProvider({
  defaultOpenLevel = 0,
  prefetch,
  children,
}: SidebarTreeOptions & { children: ReactNode }) {
  return (
    <OptionsContext
      value={useMemo(
        () => ({ defaultOpenLevel, prefetch }),
        [defaultOpenLevel, prefetch],
      )}
    >
      {children}
    </OptionsContext>
  );
}

/** Scroll the active item into view inside the sidebar when it mounts */
function useScrollIntoView(active: boolean): RefCallback<HTMLElement> {
  return useCallback(
    (element: HTMLElement | null) => {
      if (!active || !element) return;
      const boundary = element.closest<HTMLElement>(
        '[data-slot="sidebar-content"]',
      );
      if (!boundary) return;

      scrollIntoView(element, {
        boundary,
        block: "center",
        scrollMode: "if-needed",
      });
    },
    [active],
  );
}

/** Close the mobile sidebar after navigating */
function useCloseOnNavigate() {
  const { isMobile, setOpenMobile } = useSidebar();
  return () => {
    if (isMobile) setOpenMobile(false);
  };
}

export function SidebarItem({
  href,
  external,
  active = false,
  icon,
  children,
  className,
  onClick,
  ...props
}: Omit<ComponentProps<"a">, "href"> & {
  href: string;
  external?: boolean;
  active?: boolean;
  icon?: ReactNode;
}) {
  const depth = use(DepthContext);
  const { prefetch } = use(OptionsContext);
  const closeOnNavigate = useCloseOnNavigate();
  const ref = useScrollIntoView(active);
  const link = (
    <Link
      ref={ref}
      href={href}
      external={external}
      prefetch={prefetch}
      onClick={(e) => {
        onClick?.(e);
        closeOnNavigate();
      }}
      {...props}
    />
  );

  if (depth === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={link}
          isActive={active}
          className={className}
        >
          {icon}
          <span>{children}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        render={link}
        isActive={active}
        className={className}
      >
        {icon}
        <span>{children}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

export function SidebarFolder({
  name,
  icon,
  index,
  active = false,
  defaultOpen,
  collapsible = true,
  children,
}: {
  name: ReactNode;
  icon?: ReactNode;
  /** the folder's own page */
  index?: { url: string; external?: boolean; active: boolean };
  /** whether the current page is inside the folder */
  active?: boolean;
  defaultOpen?: boolean;
  collapsible?: boolean;
  children: ReactNode;
}) {
  const depth = use(DepthContext);
  const { defaultOpenLevel = 0, prefetch } = use(OptionsContext);
  const closeOnNavigate = useCloseOnNavigate();
  const ref = useScrollIntoView(index?.active ?? false);
  const t = useTranslations({ note: "sidebar" });
  const [open, setOpen] = useState(
    () => active || (defaultOpen ?? depth < defaultOpenLevel),
  );
  // open the folder when navigating into it
  const [prevActive, setPrevActive] = useState(active);
  if (prevActive !== active) {
    setPrevActive(active);
    if (active) setOpen(true);
  }

  const isOpen = !collapsible || open;
  const Item = depth === 0 ? SidebarMenuItem : SidebarMenuSubItem;
  const Button = depth === 0 ? SidebarMenuButton : SidebarMenuSubButton;
  const chevron = (
    <ChevronRight
      className={cn(
        "size-4 shrink-0 transition-transform",
        isOpen && "rotate-90",
      )}
    />
  );

  let trigger: ReactNode;
  if (index) {
    trigger = (
      <>
        <Button
          render={
            <Link
              ref={ref}
              href={index.url}
              external={index.external}
              prefetch={prefetch}
              onClick={() => {
                setOpen(true);
                closeOnNavigate();
              }}
            />
          }
          isActive={index.active}
          className={cn(collapsible && "pe-8")}
        >
          {icon}
          <span>{name}</span>
        </Button>
        {collapsible && (
          <CollapsibleTrigger
            render={
              <SidebarMenuAction
                className={cn(depth > 0 && "top-0.5 right-0.5")}
              />
            }
            aria-label={
              open
                ? t("Collapse", { note: "aria-label" })
                : t("Expand", { note: "aria-label" })
            }
          >
            {chevron}
          </CollapsibleTrigger>
        )}
      </>
    );
  } else if (collapsible) {
    trigger = (
      <CollapsibleTrigger
        render={<Button render={<button type="button" />} className="w-full" />}
      >
        {icon}
        <span className="truncate">{name}</span>
        <span className="ms-auto flex">{chevron}</span>
      </CollapsibleTrigger>
    );
  } else {
    trigger = (
      <Button render={<div />}>
        {icon}
        <span>{name}</span>
      </Button>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen} render={<Item />}>
      {trigger}
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
        <SidebarMenuSub className="me-0 pe-0">
          <DepthContext value={depth + 1}>{children}</DepthContext>
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SidebarSeparator({
  className,
  children,
  ...props
}: ComponentProps<"li">) {
  return (
    <li
      role="presentation"
      className={cn(
        "flex items-center gap-2 px-2 pt-4 pb-1 text-xs font-medium text-sidebar-foreground/70 first:pt-0 [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}

const RendererContext = createContext<
  | (Partial<SidebarPageTreeComponents> & {
      pathname: string;
    })
  | null
>(null);

function renderList(nodes: PageTree.Node[]) {
  return nodes.map((node, i) => (
    <PageTreeNode key={node.$id ?? i} node={node} />
  ));
}

function PageTreeNode({ node }: { node: PageTree.Node }) {
  const { Separator, Item, Folder, pathname } = use(RendererContext)!;
  const path = useTreePath();

  if (node.type === "separator") {
    if (Separator) return <Separator item={node} />;
    return (
      <SidebarSeparator>
        {node.icon}
        {node.name}
      </SidebarSeparator>
    );
  }

  if (node.type === "folder") {
    if (Folder) return <Folder item={node}>{renderList(node.children)}</Folder>;

    return (
      <SidebarFolder
        name={node.name}
        icon={node.icon}
        index={
          node.index && {
            url: node.index.url,
            external: node.index.external,
            active: isActive(node.index.url, pathname),
          }
        }
        active={path.includes(node)}
        defaultOpen={node.defaultOpen}
        collapsible={node.collapsible}
      >
        {renderList(node.children)}
      </SidebarFolder>
    );
  }

  if (Item) return <Item item={node} />;
  return (
    <SidebarItem
      href={node.url}
      external={node.external}
      active={isActive(node.url, pathname)}
      icon={node.icon}
    >
      {node.name}
    </SidebarItem>
  );
}

/**
 * Group the top-level nodes by separator, so each separator becomes a sidebar group label.
 */
function groupBySeparator(nodes: PageTree.Node[]) {
  const groups: { separator?: PageTree.Separator; nodes: PageTree.Node[] }[] = [
    { nodes: [] },
  ];

  for (const node of nodes) {
    if (node.type === "separator") groups.push({ separator: node, nodes: [] });
    else groups[groups.length - 1]!.nodes.push(node);
  }

  return groups.filter((group) => group.separator || group.nodes.length > 0);
}

/**
 * Render sidebar items from page tree
 */
export function SidebarPageTree(
  components: Partial<SidebarPageTreeComponents>,
) {
  const { Folder, Item, Separator } = components;
  const { root } = useTreeContext();
  const pathname = usePathname();

  return (
    <RendererContext
      value={useMemo(
        () => ({ Folder, Item, Separator, pathname }),
        [Folder, Item, Separator, pathname],
      )}
    >
      <Fragment key={root.$id}>
        {groupBySeparator(root.children).map((group, i) => (
          <SidebarGroup key={group.separator?.$id ?? i}>
            {group.separator &&
              (Separator ? (
                <Separator item={group.separator} />
              ) : (
                <SidebarGroupLabel className="gap-2">
                  {group.separator.icon}
                  {group.separator.name}
                </SidebarGroupLabel>
              ))}
            <SidebarGroupContent>
              <SidebarMenu>{renderList(group.nodes)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </Fragment>
    </RendererContext>
  );
}
