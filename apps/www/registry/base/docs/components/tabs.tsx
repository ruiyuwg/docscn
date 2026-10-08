// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  use,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  TabsContent as TabsContentPrimitive,
  TabsList as TabsListPrimitive,
  Tabs as TabsPrimitive,
  TabsTrigger as TabsTriggerPrimitive,
} from "@/components/ui/tabs";
import { mergeRefs } from "../utils/merge-refs";
import { useTabsGroup } from "../utils/tabs-group";

type CollectionKey = string | symbol;
type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export interface TabsProps extends WithStringClassName<
  Omit<ComponentProps<typeof TabsPrimitive>, "value" | "onValueChange">
> {
  /**
   * The tabs' labels. Renders the tabs list, and lets `<Tab>`s omit their
   * `value` (they're matched to `items` by their order).
   */
  items?: string[];

  /**
   * Shortcut for `defaultValue` when `items` is provided.
   *
   * @defaultValue 0
   */
  defaultIndex?: number;

  /**
   * Additional label in tabs list when `items` is provided.
   */
  label?: ReactNode;

  /**
   * Identifier for sharing the selected tab between tab groups
   */
  groupId?: string;

  /**
   * Persist the selected tab in `localStorage` (requires `groupId`)
   */
  persist?: boolean;

  /**
   * Update the URL hash to the selected tab's `id`
   */
  updateAnchor?: boolean;

  value?: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = createContext<{
  items?: string[];
  collection: CollectionKey[];
  /** Mounted panels by value, to open the tab containing a hash target */
  panels: Map<string, HTMLElement>;
  /** Tab values by their panel's `id`, including panels that aren't mounted */
  ids: Map<string, string>;
} | null>(null);

function useTabContext() {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error("You must wrap your component in <Tabs>");
  return ctx;
}

export function TabsList({
  className,
  ...props
}: WithStringClassName<ComponentProps<typeof TabsListPrimitive>>) {
  return (
    <TabsListPrimitive
      variant="line"
      {...props}
      className={cn(
        "not-docs-typeset w-full justify-start gap-3.5 overflow-x-auto px-4 group-data-horizontal/tabs:h-auto",
        className,
      )}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: WithStringClassName<ComponentProps<typeof TabsTriggerPrimitive>>) {
  return (
    <TabsTriggerPrimitive
      {...props}
      className={cn(
        "flex-none gap-2 px-0 py-2 text-sm text-muted-foreground group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-px hover:text-foreground data-active:text-foreground [&_svg]:size-4",
        className,
      )}
    />
  );
}

export function Tabs({
  ref,
  className,
  items,
  label,
  defaultIndex = 0,
  defaultValue = items ? escapeValue(items[defaultIndex] ?? "") : undefined,
  groupId,
  persist = false,
  updateAnchor = false,
  value: _value,
  onValueChange,
  children,
  ...props
}: TabsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const collection = useMemo<CollectionKey[]>(() => [], []);
  const panels = useMemo(() => new Map<string, HTMLElement>(), []);
  const ids = useMemo(() => new Map<string, string>(), []);
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue as string | undefined,
  );
  const [groupValue, setGroupValue] = useTabsGroup(groupId, persist);
  const value =
    _value ??
    (groupValue !== null &&
    (!items || items.map(escapeValue).includes(groupValue))
      ? groupValue
      : uncontrolledValue);

  // open the tab whose panel is, or contains, the element the URL hash targets
  useEffect(() => {
    function openFromHash() {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash) return;

      // a tab's own id, whether or not its panel is mounted
      const tabValue = ids.get(hash);
      if (tabValue) {
        setUncontrolledValue(tabValue);
        rootRef.current?.scrollIntoView();
        return;
      }

      // an element inside a mounted panel
      const target = document.getElementById(hash);
      if (!target) return;

      for (const [value, panel] of panels) {
        if (panel !== target && !panel.contains(target)) continue;
        setUncontrolledValue(value);
        requestAnimationFrame(() => target.scrollIntoView());
        return;
      }
    }

    const frame = requestAnimationFrame(openFromHash);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [ids, panels]);

  return (
    <TabsPrimitive
      ref={mergeRefs(ref, rootRef)}
      value={value}
      onValueChange={(v) => {
        if (typeof v !== "string") return;
        if (updateAnchor) {
          const id = [...ids].find(([, value]) => value === v)?.[0];
          if (id) window.history.replaceState(null, "", `#${id}`);
        }
        setGroupValue(v);
        setUncontrolledValue(v);
        onValueChange?.(v);
      }}
      {...props}
      className={cn(
        "my-4 gap-0 overflow-hidden rounded-xl border bg-muted/50",
        className,
      )}
    >
      {items && (
        <TabsList>
          {label && (
            <span className="my-auto me-auto text-sm font-medium">{label}</span>
          )}
          {items.map((item) => (
            <TabsTrigger key={item} value={escapeValue(item)}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      <TabsContext
        value={useMemo(
          () => ({ items, collection, panels, ids }),
          [collection, items, panels, ids],
        )}
      >
        {children}
      </TabsContext>
    </TabsPrimitive>
  );
}

export interface TabProps extends Omit<
  ComponentProps<typeof TabsContent>,
  "value"
> {
  /**
   * Value of tab, detect from index if unspecified.
   */
  value?: string;
}

export function Tab({ value, ...props }: TabProps) {
  const { items } = useTabContext();
  const resolved =
    value ??
    // eslint-disable-next-line react-hooks/rules-of-hooks -- `value` is not supposed to change
    items?.at(useCollectionIndex());
  if (!resolved)
    throw new Error(
      "Failed to resolve tab `value`, please pass a `value` prop to the Tab component.",
    );

  return (
    <TabsContent value={escapeValue(resolved)} {...props}>
      {props.children}
    </TabsContent>
  );
}

export function TabsContent({
  ref,
  value,
  className,
  ...props
}: WithStringClassName<ComponentProps<typeof TabsContentPrimitive>>) {
  const { panels, ids } = useTabContext();
  if (props.id) ids.set(props.id, value as string);

  return (
    <TabsContentPrimitive
      ref={mergeRefs(ref, (element: HTMLDivElement | null) => {
        if (element) panels.set(value as string, element);
        else panels.delete(value as string);
      })}
      value={value}
      {...props}
      className={cn(
        "rounded-xl bg-background p-4 text-[0.9375rem] *:first:mt-0 *:last:mb-0 [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-xl [&>figure:only-child]:border-none",
        className,
      )}
    >
      {props.children}
    </TabsContentPrimitive>
  );
}

/**
 * Inspired by Headless UI.
 *
 * Return the index of children, this is made possible by registering the order of render from children using React context.
 * This is supposed by work with pre-rendering & pure client-side rendering.
 */
function useCollectionIndex() {
  const key = useId();
  const { collection } = useTabContext();

  useEffect(() => {
    return () => {
      const idx = collection.indexOf(key);
      if (idx !== -1) collection.splice(idx, 1);
    };
  }, [key, collection]);

  if (!collection.includes(key)) collection.push(key);
  return collection.indexOf(key);
}

/**
 * only escape whitespaces in values in simple mode
 */
function escapeValue(v: string): string {
  return v.toLowerCase().replace(/\s/, "-");
}
