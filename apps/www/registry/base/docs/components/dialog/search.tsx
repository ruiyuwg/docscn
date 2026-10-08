// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { T, useTranslations } from "@fuma-translate/react";
import { ChevronRight, Hash, SearchIcon } from "lucide-react";
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
} from "react";
import { cn } from "cn";
import { Dialog } from "@base-ui/react/dialog";
import type { ReactSortedResult } from "fumadocs-core/search";
import { cva } from "class-variance-authority";
import { useRouter } from "fumadocs-core/framework";
import type { SharedProps } from "../../contexts/search";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import scrollIntoView from "scroll-into-view-if-needed";
import { Kbd } from "@/components/ui/kbd";
import { createMarkdownRenderer } from "fumadocs-core/content/md";
import rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";
import type { Transformer } from "unified";
import type { Root } from "hast";
import { mergeRefs } from "../../utils/merge-refs";

export type SearchItemType =
  | (ReactSortedResult & {
      external?: boolean;
    })
  | {
      id: string;
      type: "action";
      node: ReactNode;
      onSelect: () => void;
    };

export type { SharedProps };

export interface SearchDialogProps extends SharedProps {
  search: string;
  onSearchChange: (v: string) => void;
  onSelect?: (item: SearchItemType) => void;
  isLoading?: boolean;

  children: ReactNode;
}

const RootContext = createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (item: SearchItemType) => void;
  isLoading: boolean;
} | null>(null);

const ListContext = createContext<{
  active: string | null;
  setActive: (v: string | null) => void;
} | null>(null);

const TagsListContext = createContext<{
  value?: string;
  onValueChange: (value: string | undefined) => void;
  allowClear: boolean;
} | null>(null);

const PreContext = createContext(false);

const mdRenderer = createMarkdownRenderer({
  remarkRehypeOptions: {
    allowDangerousHtml: true,
  },
  rehypePlugins: [rehypeRaw, rehypeCustomElements],
});

const mdComponents = {
  mark(props: ComponentProps<"mark">) {
    return <span {...props} className="text-primary underline" />;
  },
  a: "span",
  p(props: ComponentProps<"p">) {
    return <p {...props} className="min-w-0" />;
  },
  strong(props: ComponentProps<"strong">) {
    return <strong {...props} className="font-medium text-accent-foreground" />;
  },
  code(props: ComponentProps<"pre">) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- this is a component
    const inPre = use(PreContext);
    if (inPre)
      return (
        <code
          {...props}
          className="mask-[linear-gradient(to_bottom,white,white_30px,transparent_80px)]"
        />
      );

    return (
      <code
        {...props}
        className="rounded-md border bg-secondary px-px text-secondary-foreground"
      />
    );
  },
  custom({
    _tagName = "fragment",
    children,
    ...rest
  }: Record<string, unknown> & { _tagName: string; children: ReactNode }) {
    return (
      <span className="inline-flex max-w-full items-center divide-x divide-border rounded-md border bg-card p-0.5 text-card-foreground">
        <code className="me-1 rounded-sm border-none bg-primary px-0.5 text-xs font-medium text-primary-foreground">
          {_tagName}
        </code>
        {Object.entries(rest).map(([k, v]) => {
          if (typeof v !== "string") return;

          return (
            <code
              key={k}
              className="truncate px-1 text-xs text-muted-foreground"
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
          "my-0.5 flex max-h-20 flex-col overflow-hidden rounded-md border bg-secondary p-2 text-secondary-foreground",
          props.className,
        )}
      >
        <PreContext value={true}>{props.children}</PreContext>
      </pre>
    );
  },
};

function rehypeCustomElements(): Transformer<Root, Root> {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === "element" &&
        document.createElement(node.tagName) instanceof HTMLUnknownElement
      ) {
        node.properties._tagName = node.tagName;
        node.tagName = "custom";
      }
    });
  };
}

/** A ref to the latest value, for callbacks that shouldn't change identity */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

export function SearchDialog({
  open,
  onOpenChange,
  search,
  onSearchChange,
  isLoading = false,
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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} handle={dialogHandle}>
      <RootContext
        value={useMemo(
          () => ({
            open,
            search,
            isLoading,
            onOpenChange: (v) => onOpenChangeCallback.current(v),
            onSearchChange: (v) => onSearchChangeCallback.current(v),
            onSelect: (v) => onSelectCallback.current(v),
          }),
          [
            isLoading,
            open,
            search,
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
  const { search, onSearchChange } = useSearch();
  const t = useTranslations({ note: "search dialog" });

  return (
    <input
      data-fd-search-dialog-input=""
      role="combobox"
      aria-expanded={false}
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
  items = null,
  Empty = () => (
    <div
      role="status"
      className="py-12 text-center text-sm text-muted-foreground"
    >
      <T text="No results found" note="search dialog" />
    </div>
  ),
  Item = (props) => <SearchDialogListItem {...props} />,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  items: SearchItemType[] | null | undefined;
  /**
   * Renderer for empty list UI
   */
  Empty?: () => ReactNode;
  /**
   * Renderer for items
   */
  Item?: (props: { item: SearchItemType; onClick: () => void }) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations({ note: "search dialog" });
  const { onSelect } = useSearch();
  const [active, setActive] = useState<string | null>(
    () => items?.[0]?.id ?? null,
  );

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!items || e.isComposing || e.keyCode === 229) return;

    if (e.key === "ArrowDown" || e.key == "ArrowUp") {
      let idx = items.findIndex((item) => item.id === active);
      if (idx === -1) idx = 0;
      else if (e.key === "ArrowDown") idx++;
      else idx--;

      setActive(items.at(idx % items.length)?.id ?? null);
      e.preventDefault();
    }

    if (e.key === "Enter") {
      const selected = items.find((item) => item.id === active);

      if (selected) onSelect(selected);
      e.preventDefault();
    }
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      const viewport = element.firstElementChild!;

      element.style.setProperty(
        "--fd-animated-height",
        `${viewport.clientHeight}px`,
      );
    });

    const viewport = element.firstElementChild;
    if (viewport) observer.observe(viewport);

    const content: Pick<Window, "addEventListener" | "removeEventListener"> =
      document.getElementById("fd-search-dialog-content") ?? window;
    content.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      content.removeEventListener("keydown", onKey);
    };
  }, []);

  useOnChange(items, () => {
    setActive(items?.[0]?.id ?? null);
  });

  // the combobox input is a sibling, sync its state here
  useEffect(() => {
    const input = ref.current
      ?.closest('[role="dialog"]')
      ?.querySelector('[role="combobox"]');
    if (!input) return;

    input.setAttribute("aria-expanded", String(active !== null));
    if (active !== null)
      input.setAttribute("aria-activedescendant", `fd-search-option-${active}`);
    else input.removeAttribute("aria-activedescendant");
  }, [active]);

  return (
    <div
      {...props}
      ref={ref}
      data-empty={items === null}
      className={cn(
        "h-(--fd-animated-height) overflow-hidden transition-[height]",
        props.className,
      )}
    >
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
        <ListContext
          value={useMemo(
            () => ({
              active,
              setActive,
            }),
            [active],
          )}
        >
          {items?.length === 0 && Empty()}

          {items?.map((item) => (
            <Fragment key={item.id}>
              {Item({ item, onClick: () => onSelect(item) })}
            </Fragment>
          ))}
        </ListContext>
      </div>
    </div>
  );
}

export function SearchDialogListItem({
  item,
  className,
  children,
  renderMarkdown = (s) => (
    <mdRenderer.Markdown components={mdComponents}>{s}</mdRenderer.Markdown>
  ),
  ...props
}: ComponentProps<"button"> & {
  renderMarkdown?: (v: string) => ReactNode;
  item: SearchItemType;
}) {
  const { active: activeId, setActive } = useSearchList();
  const active = item.id === activeId;

  if (item.type === "action") {
    children ??= item.node;
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
          className={cn(
            "min-w-0",
            item.type === "text" && "ps-4",
            item.type === "heading" && "ps-8",
            item.type === "page" || item.type === "heading"
              ? "font-medium"
              : "text-popover-foreground/80",
          )}
        >
          {typeof item.content === "string"
            ? renderMarkdown(item.content)
            : item.content}
        </div>
      </>
    );
  }

  return (
    <button
      type="button"
      id={`fd-search-option-${item.id}`}
      role="option"
      tabIndex={-1}
      ref={useCallback(
        (element: HTMLButtonElement | null) => {
          if (active && element) {
            scrollIntoView(element, {
              scrollMode: "if-needed",
              block: "nearest",
              boundary: element.parentElement,
            });
          }
        },
        [active],
      )}
      aria-selected={active}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg px-2.5 py-2 text-start text-sm select-none",
        active && "bg-accent text-accent-foreground",
        className,
      )}
      onPointerMove={() => setActive(item.id)}
      {...props}
    >
      {children}
    </button>
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

export function useSearchList() {
  const ctx = use(ListContext);
  if (!ctx) throw new Error("Missing <SearchDialogList />");
  return ctx;
}
