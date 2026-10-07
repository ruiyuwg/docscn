// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  type ComponentType,
  createContext,
  type ReactNode,
  Suspense,
  use,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useHotKey } from "../utils/hotkey";

export interface HotKey {
  display: ReactNode;

  /**
   * Key code or a function determining whether the key is pressed.
   */
  key: string | ((e: KeyboardEvent) => boolean);
}

/** built-in Base UI Dialog handle */
const dialogHandle = Dialog.createHandle();

export interface SharedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogHandle: Dialog.Handle<unknown>;
}

export type SearchLink = [name: string, href: string];

export interface TagItem {
  name: string;
  value: string;
}

export interface SearchProviderProps<
  DialogProps extends SharedProps = SharedProps,
> {
  /**
   * Custom links to be displayed if search is empty
   */
  links?: SearchLink[];

  /**
   * Hotkeys for triggering search dialog
   *
   * @defaultValue Meta/Ctrl + K
   */
  hotKey?: HotKey[];

  /**
   * The search dialog, e.g. `DefaultSearchDialog` or one for another search solution.
   *
   * It receives the `open` and `onOpenChange` prop, can be lazy loaded with `React.lazy()`
   */
  SearchDialog?: ComponentType<DialogProps>;

  /**
   * Additional props to the dialog
   */
  options?: Partial<DialogProps>;

  children?: ReactNode;
}

interface SearchContextType {
  enabled: boolean;
  open: boolean;
  hotKey: HotKey[];
  setOpenSearch: (value: boolean) => void;
  dialogHandle: Dialog.Handle<unknown>;
}

const SearchContext = createContext<SearchContextType>({
  enabled: false,
  open: false,
  hotKey: [],
  setOpenSearch: () => undefined,
  dialogHandle,
});

export function useSearchContext(): SearchContextType {
  return use(SearchContext);
}

const noop = () => () => {};

function MetaOrControl() {
  // `false` on the server and during hydration
  const isClient = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  return isClient && /Windows|Linux/i.test(navigator.userAgent) ? "Ctrl" : "⌘";
}

const DEFAULT_HOT_KEYS: HotKey[] = [
  {
    key: (e) => e.metaKey || e.ctrlKey,
    display: <MetaOrControl />,
  },
  {
    key: "k",
    display: "K",
  },
];

export function SearchProvider<DialogProps extends SharedProps = SharedProps>({
  SearchDialog,
  children,
  options,
  hotKey = DEFAULT_HOT_KEYS,
  links,
}: SearchProviderProps<DialogProps>) {
  const [isOpen, setIsOpen] = useState(false);
  useHotKey((e) => {
    if (
      hotKey.every((v) =>
        typeof v.key === "string" ? e.key === v.key : v.key(e),
      )
    ) {
      setIsOpen((open) => !open);
      e.preventDefault();
    }
  });

  return (
    <SearchContext
      value={useMemo(
        () => ({
          enabled: true,
          open: isOpen,
          hotKey,
          dialogHandle,
          setOpenSearch: setIsOpen,
        }),
        [isOpen, hotKey],
      )}
    >
      {SearchDialog && (
        <Suspense fallback={null}>
          {/* @ts-expect-error -- assume all required props are filled */}
          <SearchDialog
            open={isOpen}
            onOpenChange={setIsOpen}
            links={links}
            dialogHandle={dialogHandle}
            {...options}
          />
        </Suspense>
      )}

      {children}
    </SearchContext>
  );
}

/**
 * Show children only when search is enabled via React Context
 */
export function SearchOnly({ children }: { children: ReactNode }) {
  const search = useSearchContext();

  if (search.enabled) return children;
}
