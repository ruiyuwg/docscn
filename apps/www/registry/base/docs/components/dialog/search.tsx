// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { T, useTranslations } from "@fuma-translate/react";
import { ChevronRight, CircleAlert, Hash, SearchIcon } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  Fragment,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "cn";
import { Dialog } from "@base-ui/react/dialog";
import type { ReactSortedResult } from "fumadocs-core/search";
import {
  useHighlightQuery,
  type SearchResult,
  type SearchResultItem,
  type SearchResultRecord,
  type SearchResultTable,
} from "fumadocs-core/search/client";
import { toJsx, type ToJsxOptions } from "fumadocs-core/utils/hast-to-jsx";
import { cva } from "class-variance-authority";
import { useRouter } from "fumadocs-core/framework";
import type { SharedProps } from "../../contexts/search";
import scrollIntoView from "scroll-into-view-if-needed";
import { Kbd } from "@/components/ui/kbd";
import { mergeRefs } from "../../utils/merge-refs";

export type SearchItemType =
  | ((ReactSortedResult | SearchResultRecord) & {
      external?: boolean;
    })
  | {
      id: string;
      type: "action";
      node: ReactNode;
      onSelect: () => void;
    };

type ItemRenderer = (props: {
  item: SearchItemType;
  table?: SearchResultTable;
  onClick: () => void;
}) => ReactNode;

interface TableProps {
  table: SearchResultTable;
  Item: ItemRenderer;
  onSelect: (item: SearchItemType) => void;
}

export type { SharedProps };

export interface SearchDialogProps extends SharedProps {
  search: string;
  onSearchChange: (v: string) => void;
  onSelect?: (item: SearchItemType) => void;
  isLoading?: boolean;
  /** the last successful search, `<SearchDialogList />` shows its results */
  data?: SearchResult;
  /** the last search failed, `<SearchDialogList />` shows it above the results of `data` */
  error?: Error;

  children: ReactNode;
}

const RootContext = createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (item: SearchItemType) => void;
  isLoading: boolean;
  data?: SearchResult;
  error?: Error;
  /** the query to highlight */
  query: string;
  /** the id of the active item */
  getActive: () => string | null;
  setActive: (id: string | null) => void;
  subscribeActive: (listener: () => void) => () => void;
} | null>(null);

const TagsListContext = createContext<{
  value?: string;
  onValueChange: (value: string | undefined) => void;
  allowClear: boolean;
} | null>(null);

const mdComponents = {
  // from the deprecated `highlightMarkdown()` of custom search clients
  mark(props: ComponentProps<"mark">) {
    return <span {...props} className="text-primary underline" />;
  },
  a: "span" as const,
  p(props: ComponentProps<"p">) {
    return <p {...props} className="min-w-0" />;
  },
  custom({
    tagName,
    children,
    ...rest
  }: Record<string, unknown> & { tagName: string; children?: ReactNode }) {
    return (
      <span className="inline-flex max-w-full items-center divide-x divide-border rounded-md border bg-card p-0.5 text-card-foreground">
        <code
          data-highlight-ignore=""
          className="not-docs-typeset me-1 rounded-sm border-none bg-primary px-0.5 text-xs font-medium text-primary-foreground"
        >
          {tagName}
        </code>
        {Object.entries(rest).map(([k, v]) => {
          if (typeof v !== "string") return;

          return (
            <code
              key={k}
              data-highlight-ignore=""
              className="not-docs-typeset truncate px-1 text-xs text-muted-foreground"
            >
              <span className="text-card-foreground">{k}: </span>
              {v}
            </code>
          );
        })}
        {children && <span className="ps-1">{children}</span>}
      </span>
    );
  },
  pre(props: ComponentProps<"pre">) {
    return (
      <pre
        {...props}
        className={cn(
          "not-docs-typeset my-0.5 flex max-h-20 flex-col overflow-hidden rounded-md border bg-secondary p-2 text-secondary-foreground *:mask-[linear-gradient(to_bottom,white,white_30px,transparent_80px)]",
          props.className,
        )}
      />
    );
  },
};

const renderOptions: ToJsxOptions = { components: mdComponents };

function Children({ children }: { children?: ReactNode }) {
  return children;
}

function TableCell(props: ComponentProps<"div">) {
  return (
    <div {...props} className="min-w-0 not-last:truncate last:line-clamp-2" />
  );
}

// tables of cards render their cells only, the grid of `<SearchDialogListTable />` lays them out
const tableRenderOptions: ToJsxOptions = {
  components: {
    ...mdComponents,
    table: Children,
    thead: Children,
    tbody: Children,
    tr: Children,
    th: TableCell,
    td: TableCell,
  },
};

// rows of tables with header, `<SearchDialogListTable />` shows the header once
const rowRenderOptions: ToJsxOptions = {
  components: { ...tableRenderOptions.components, thead: () => null },
};

/** A ref to the latest value, for callbacks that shouldn't change identity */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

function createActiveItem() {
  let active: string | null = null;
  const listeners = new Set<() => void>();

  return {
    getActive: () => active,
    setActive(id: string | null) {
      active = id;
      for (const listener of listeners) listener();
    },
    subscribeActive(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}

export function SearchDialog({
  open,
  onOpenChange,
  search,
  onSearchChange,
  isLoading = false,
  data,
  error,
  onSelect: onSelectProp,
  children,
  dialogHandle,
}: SearchDialogProps) {
  const router = useRouter();
  const onOpenChangeCallback = useLatest(onOpenChange);
  const onSearchChangeCallback = useLatest(onSearchChange);
  const onSelect = (item: SearchItemType) => {
    if (item.type === "action") {
      item.onSelect();
    } else if (item.external) {
      window.open(item.url, "_blank")?.focus();
    } else {
      router.push(item.url);
    }

    onOpenChange(false);
    onSelectProp?.(item);
  };
  const onSelectCallback = useLatest(onSelect);
  // the input and items subscribe to the active item, so only they re-render when it changes
  const [activeItem] = useState(createActiveItem);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} handle={dialogHandle}>
      <RootContext
        value={useMemo(
          () => ({
            ...activeItem,
            open,
            search,
            isLoading,
            data,
            error,
            query: data ? data.query : search,
            onOpenChange: (v) => onOpenChangeCallback.current(v),
            onSearchChange: (v) => onSearchChangeCallback.current(v),
            onSelect: (v) => onSelectCallback.current(v),
          }),
          [
            activeItem,
            isLoading,
            open,
            search,
            data,
            error,
            onOpenChangeCallback,
            onSearchChangeCallback,
            onSelectCallback,
          ],
        )}
      >
        {children}
      </RootContext>
    </Dialog.Root>
  );
}

export function SearchDialogHeader(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("flex flex-row items-center gap-2 p-3", props.className)}
    />
  );
}

export function SearchDialogInput(props: ComponentProps<"input">) {
  const { search, onSearchChange, getActive, subscribeActive } = useSearch();
  const active = useSyncExternalStore(subscribeActive, getActive, getActive);
  const t = useTranslations({ note: "search dialog" });

  return (
    <input
      data-fd-search-dialog-input=""
      role="combobox"
      aria-expanded={active !== null}
      aria-activedescendant={
        active !== null ? `fd-search-option-${active}` : undefined
      }
      aria-label={t("Search")}
      aria-autocomplete="list"
      aria-controls="fd-search-list"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder={t("Search")}
      {...props}
      className={cn(
        "w-0 flex-1 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:outline-none",
        props.className,
      )}
    />
  );
}

export function SearchDialogClose({
  children = "ESC",
  className,
  ...props
}: ComponentProps<"button">) {
  const { onOpenChange } = useSearch();
  const t = useTranslations({ note: "search dialog" });

  return (
    <button
      type="button"
      aria-label={t("Close Search", { note: "aria-label" })}
      onClick={() => onOpenChange(false)}
      className={cn(
        "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      <Kbd className="font-mono">{children}</Kbd>
    </button>
  );
}

export function SearchDialogFooter(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("bg-muted/50 p-3 empty:hidden", props.className)}
    />
  );
}

export function SearchDialogOverlay({
  className,
  ...props
}: ComponentProps<typeof Dialog.Backdrop>) {
  return (
    <Dialog.Backdrop
      {...props}
      className={(s) =>
        cn(
          "fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          typeof className === "function" ? className(s) : className,
        )
      }
    />
  );
}

export function SearchDialogContent({
  ref,
  children,
  className,
  ...props
}: ComponentProps<typeof Dialog.Popup>) {
  const t = useTranslations({ note: "search dialog" });
  const localRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog.Portal>
      <Dialog.Popup
        id="fd-search-dialog-content"
        ref={mergeRefs(ref, localRef)}
        aria-describedby={undefined}
        initialFocus={(s) => {
          const input = localRef.current?.querySelector<HTMLInputElement>(
            "input[data-fd-search-dialog-input]",
          );
          if (s === "touch") {
            input?.focus({ preventScroll: true });
            return false;
          }
          return input;
        }}
        className={(s) =>
          cn(
            "fixed top-4 left-1/2 z-50 w-[calc(100%-1rem)] max-w-screen-sm -translate-x-1/2 overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/10 duration-100 focus-visible:outline-none md:top-[calc(50%-250px)] data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            "*:border-b *:last:border-b-0 *:has-[+:last-child[data-empty=true]]:border-b-0 *:data-[empty=true]:border-b-0",
            typeof className === "function" ? className(s) : className,
          )
        }
        {...props}
      >
        <Dialog.Title className="hidden">{t("Search")}</Dialog.Title>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

export function SearchDialogList({
  items: itemsProp,
  defaultItems = null,
  Empty = () => (
    <div
      role="status"
      className="py-12 text-center text-sm text-muted-foreground"
    >
      <T text="No results found" note="search dialog" />
    </div>
  ),
  Item = (props) => <SearchDialogListItem {...props} />,
  Table = (props) => <SearchDialogListTable {...props} />,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  /** @defaultValue the results of `data` from `<SearchDialog />` */
  items?: (SearchItemType | SearchResultItem)[] | null;
  /** shown without results */
  defaultItems?: (SearchItemType | SearchResultItem)[] | null;
  /**
   * Renderer for empty list UI
   */
  Empty?: () => ReactNode;
  /**
   * Renderer for items
   */
  Item?: ItemRenderer;
  /**
   * Renderer for tables, `Item` and `onSelect` render their rows
   */
  Table?: (props: TableProps) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations({ note: "search dialog" });
  const { onSelect, data, error, getActive, setActive } = useSearch();
  const items =
    itemsProp === undefined ? (data?.items ?? defaultItems) : itemsProp;

  useLayoutEffect(
    () => setActive(error ? null : (items?.[0]?.id ?? null)),
    [setActive, items, error],
  );

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!items || e.isComposing || e.keyCode === 229) return;
    const list = flattenItems(items);

    if (e.key === "ArrowDown" || e.key == "ArrowUp") {
      let idx = list.findIndex((item) => item.id === getActive());
      if (idx === -1) idx = 0;
      else if (e.key === "ArrowDown") idx++;
      else idx--;

      setActive(list.at(idx % list.length)?.id ?? null);
      e.preventDefault();
    }

    if (e.key === "Enter") {
      const selected = list.find((item) => item.id === getActive());

      if (selected) onSelect(selected);
      e.preventDefault();
    }
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      let height = 0;
      for (const child of element.children)
        height += (child as HTMLElement).offsetHeight;

      element.style.setProperty("--fd-animated-height", `${height}px`);
    });

    for (const child of element.children) observer.observe(child);

    const content: Pick<Window, "addEventListener" | "removeEventListener"> =
      document.getElementById("fd-search-dialog-content") ?? window;
    content.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      content.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      {...props}
      ref={ref}
      data-empty={items === null && !error}
      className={cn(
        "h-(--fd-animated-height) overflow-hidden transition-[height] [&_::highlight(fd-search)]:text-primary [&_::highlight(fd-search)]:underline",
        props.className,
      )}
    >
      <p
        role="status"
        className={cn(
          "truncate text-sm not-empty:p-3",
          items && "not-empty:border-b",
        )}
      >
        {error && (
          <>
            <CircleAlert className="me-2 inline size-5 align-top text-destructive" />
            {data ? (
              <T
                text="Search failed, showing results for {query}"
                note="search dialog"
                variables={{
                  query: <span className="font-medium">{data.query}</span>,
                }}
              />
            ) : (
              <T text="Search failed" note="search dialog" />
            )}
          </>
        )}
      </p>
      <div
        id="fd-search-list"
        // an empty listbox is invalid, expose it only with options
        role={items?.length ? "listbox" : undefined}
        aria-label={items?.length ? t("Search") : undefined}
        className={cn(
          "flex max-h-[460px] w-full flex-col overflow-y-auto p-1",
          !items && "hidden",
        )}
      >
        {items?.length === 0 && Empty()}

        {items?.map((item) => (
          <Fragment key={item.id}>
            {item.type === "table"
              ? Table({ table: item, Item, onSelect })
              : Item({ item, onClick: () => onSelect(item) })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function flattenItems(
  items: (SearchItemType | SearchResultItem)[],
): SearchItemType[] {
  const out: SearchItemType[] = [];
  for (const item of items) {
    if (item.type === "table") out.push(...item.rows);
    else out.push(item);
  }

  return out;
}

export function SearchDialogListTable({ table, Item, onSelect }: TableProps) {
  const { query } = useSearch();
  const highlightRef = useHighlightQuery(query);
  const headerId = `fd-search-table-${table.id}`;
  const header = useMemo(
    () => table.header && toJsx(table.header, tableRenderOptions),
    [table.header],
  );

  return (
    <div
      // the header names the rows
      role={table.header ? "group" : undefined}
      aria-labelledby={table.header ? headerId : undefined}
      className="ms-3 shrink-0 border-s py-2 ps-3.25 pe-2.5"
    >
      <div
        className="grid gap-x-3 overflow-hidden rounded-lg border bg-card text-sm"
        style={{
          gridTemplateColumns: `${"fit-content(30%) ".repeat(table.columns - 1)}minmax(30%, 1fr)`,
        }}
      >
        {header && (
          <div
            id={headerId}
            ref={highlightRef}
            aria-hidden
            className="col-span-full grid grid-cols-subgrid bg-secondary px-3 py-1 text-xs text-muted-foreground"
          >
            {header}
          </div>
        )}
        {table.rows.map((row) => (
          <Fragment key={row.id}>
            {Item({ item: row, table, onClick: () => onSelect(row) })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function SearchDialogListItem({
  item,
  table,
  className,
  children,
  renderMarkdown,
  ...props
}: ComponentProps<"div"> & {
  /** the table of a row */
  table?: SearchResultTable;
  /** render the Markdown `content` of items, instead of their `hastContent` */
  renderMarkdown?: (v: string) => ReactNode;
  item: SearchItemType;
}) {
  const { query, getActive, setActive, subscribeActive } = useSearch();
  const isActive = () => getActive() === item.id;
  const active = useSyncExternalStore(subscribeActive, isActive, isActive);
  const highlightRef = useHighlightQuery(query);
  const content = useMemo(() => {
    if (item.type === "action") return item.node;
    if (renderMarkdown && typeof item.content === "string")
      return renderMarkdown(item.content);
    if (!("hastContent" in item)) return item.content;
    if (!table) return toJsx(item.hastContent, renderOptions);
    return toJsx(
      item.hastContent,
      table.header ? rowRenderOptions : tableRenderOptions,
    );
  }, [item, renderMarkdown, table]);

  if (item.type === "action") {
    children ??= content;
  } else if (table) {
    children ??= (
      <div
        ref={highlightRef}
        className={cn(
          "contents",
          // rows without header, like the props of type tables
          !table.header &&
            "*:not-first:text-muted-foreground *:first:font-medium *:first:text-primary *:nth-2:text-xs",
        )}
      >
        {content}
      </div>
    );
  } else {
    children ??= (
      <>
        <div className="inline-flex items-center text-xs text-muted-foreground empty:hidden">
          {item.breadcrumbs?.map((item, i) => (
            <Fragment key={i}>
              {i > 0 && <ChevronRight className="size-4 rtl:rotate-180" />}
              {item}
            </Fragment>
          ))}
        </div>

        {item.type !== "page" && (
          <div
            role="none"
            className="absolute inset-y-0 inset-s-3 w-px bg-border"
          />
        )}
        {item.type === "heading" && (
          <Hash className="absolute inset-s-6 top-2.5 size-4 text-muted-foreground" />
        )}
        <div
          ref={highlightRef}
          className={cn(
            "docs-typeset min-w-0 text-sm",
            item.type === "text" && "ps-4",
            item.type === "heading" && "ps-8",
            item.type === "page" || item.type === "heading"
              ? "font-medium text-inherit"
              : "text-popover-foreground/80",
          )}
        >
          {content}
        </div>
      </>
    );
  }

  return (
    <div
      id={`fd-search-option-${item.id}`}
      role="option"
      ref={useCallback(
        (element: HTMLDivElement | null) => {
          if (active && element) {
            scrollIntoView(element, {
              scrollMode: "if-needed",
              block: "nearest",
              boundary: element.closest('[role="listbox"]'),
            });
          }
        },
        [active],
      )}
      aria-selected={active}
      className={cn(
        "cursor-default",
        table
          ? "col-span-full grid grid-cols-subgrid items-baseline px-3 py-1.5 not-first:border-t"
          : "relative shrink-0 overflow-hidden rounded-lg px-2.5 py-2 text-sm",
        active && "bg-accent text-accent-foreground",
        className,
      )}
      onPointerMove={() => setActive(item.id)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SearchDialogIcon(props: ComponentProps<"svg">) {
  const { isLoading } = useSearch();

  return (
    <SearchIcon
      {...props}
      className={cn(
        "size-5 text-muted-foreground",
        isLoading && "animate-pulse duration-400",
        props.className,
      )}
    />
  );
}

export interface TagsListProps extends ComponentProps<"div"> {
  tag?: string;
  onTagChange: (tag: string | undefined) => void;
  allowClear?: boolean;
}

const itemVariants = cva(
  "rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors",
  {
    variants: {
      active: {
        true: "bg-accent text-accent-foreground",
      },
    },
  },
);
export function TagsList({
  tag,
  onTagChange,
  allowClear = false,
  ...props
}: TagsListProps) {
  const onTagChangeCallback = useLatest(onTagChange);
  return (
    <div
      {...props}
      className={cn("flex flex-wrap items-center gap-1", props.className)}
    >
      <TagsListContext
        value={useMemo(
          () => ({
            value: tag,
            onValueChange: (v) => onTagChangeCallback.current(v),
            allowClear,
          }),
          [allowClear, tag, onTagChangeCallback],
        )}
      >
        {props.children}
      </TagsListContext>
    </div>
  );
}

export function TagsListItem({
  value,
  className,
  ...props
}: ComponentProps<"button"> & {
  value: string;
}) {
  const { onValueChange, value: selectedValue, allowClear } = useTagsList();
  const selected = value === selectedValue;

  return (
    <button
      type="button"
      data-active={selected}
      className={cn(itemVariants({ active: selected, className }))}
      onClick={() => onValueChange(selected && allowClear ? undefined : value)}
      tabIndex={-1}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function useSearch() {
  const ctx = use(RootContext);
  if (!ctx) throw new Error("Missing <SearchDialog />");
  return ctx;
}

export function useTagsList() {
  const ctx = use(TagsListContext);
  if (!ctx) throw new Error("Missing <TagsList />");
  return ctx;
}
