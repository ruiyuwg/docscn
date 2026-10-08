// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";
import { useTranslations } from "@fuma-translate/react";
import * as TocDefault from "../../../../components/toc/default";
import * as TocClerk from "../../../../components/toc/clerk";
import * as TocBlock from "../../../../components/toc/block";
import * as Base from "../../../../components/toc";
import { cn } from "cn";
import { ChevronDown, Text } from "lucide-react";
import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useTreePath } from "../../../../contexts/tree";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useDocsLayout } from "../../client";
import { findLastIndex } from "../../../../utils/array";

const variants = { normal: TocDefault, clerk: TocClerk, block: TocBlock };

export type TOCProviderProps = Base.TOCProviderProps;

export function TOCProvider(props: TOCProviderProps) {
  return <Base.TOCProvider {...props} />;
}

export type TOCProps = {
  container?: ComponentProps<"div">;
  /**
   * Custom content in TOC container, before the main TOC
   */
  header?: ReactNode;

  /**
   * Custom content in TOC container, after the main TOC
   */
  footer?: ReactNode;
} & (
  | {
      style?: "normal";
      list?: TocDefault.TOCItemsProps;
    }
  | {
      style: "clerk";
      list?: TocClerk.TOCItemsProps;
    }
  | {
      style: "block";
      list?: TocBlock.TOCItemsProps;
    }
);

export function TOC({
  container,
  header,
  footer,
  style = "normal",
  list,
}: TOCProps) {
  const t = useTranslations({ note: "table of contents" });
  const items = Base.useTOCItems();
  const { TOCItems, TOCEmpty, TOCItem } = variants[style];

  if (items.length === 0 && !header && !footer) {
    return (
      <div
        id="nd-toc-placeholder"
        className="w-[268px] shrink-0 max-xl:hidden"
      />
    );
  }

  return (
    <div
      id="nd-toc"
      {...container}
      className={cn(
        "sticky top-(--docs-banner-height,0px) flex h-[calc(100svh-var(--docs-banner-height,0px))] w-[268px] shrink-0 flex-col pe-4 pt-12 pb-2 max-xl:hidden",
        container?.className,
      )}
    >
      {header}
      <h3
        id="toc-title"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Text className="size-4" />
        {t("On this page")}
      </h3>
      <Base.TOCScrollArea className="ms-px">
        <TOCItems {...list}>
          {items.length === 0 && <TOCEmpty />}
          {items.map((item) => (
            <TOCItem key={item.url} item={item} />
          ))}
        </TOCItems>
      </Base.TOCScrollArea>
      {footer}
    </div>
  );
}

const TocPopoverContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export type TOCPopoverProps = {
  container?: ComponentProps<"div">;
  trigger?: ComponentProps<"button">;
  content?: ComponentProps<"div">;

  /**
   * Custom content in TOC container, before the main TOC
   */
  header?: ReactNode;

  /**
   * Custom content in TOC container, after the main TOC
   */
  footer?: ReactNode;
} & (
  | {
      style?: "normal";
      list?: TocDefault.TOCItemsProps;
    }
  | {
      style: "clerk";
      list?: TocClerk.TOCItemsProps;
    }
  | {
      style: "block";
      list?: TocBlock.TOCItemsProps;
    }
);

export function TOCPopover({
  container,
  trigger,
  content,
  header,
  footer,
  style = "normal",
  list,
}: TOCPopoverProps) {
  const items = Base.useTOCItems();
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { isNavTransparent } = useDocsLayout();
  const { TOCItems, TOCItem, TOCEmpty } = variants[style];

  const onClickOutside = useEffectEvent((e: Event) => {
    if (!open || !(e.target instanceof HTMLElement)) return;

    if (ref.current && !ref.current.contains(e.target)) setOpen(false);
  });

  const onClickItem = () => {
    setOpen(false);
  };

  useEffect(() => {
    window.addEventListener("click", onClickOutside);

    return () => {
      window.removeEventListener("click", onClickOutside);
    };
  }, []);

  return (
    <TocPopoverContext
      value={useMemo(
        () => ({
          open,
          setOpen,
        }),
        [setOpen, open],
      )}
    >
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        data-toc-popover=""
        {...container}
        className={cn(
          "sticky top-[calc(var(--docs-header-height)+var(--docs-banner-height,0px))] z-10 h-10 xl:hidden",
          container?.className,
        )}
      >
        <header
          ref={ref}
          className={cn(
            "border-b backdrop-blur-sm transition-colors",
            (!isNavTransparent || open) && "bg-background/80",
            open && "shadow-lg",
          )}
        >
          <PageTOCPopoverTrigger {...trigger} />
          <PageTOCPopoverContent {...content}>
            {header}
            <Base.TOCScrollArea className="ms-px">
              <TOCItems {...list}>
                {items.length === 0 && <TOCEmpty />}
                {items.map((item) => (
                  <TOCItem key={item.url} item={item} onClick={onClickItem} />
                ))}
              </TOCItems>
            </Base.TOCScrollArea>
            {footer}
          </PageTOCPopoverContent>
        </header>
      </Collapsible>
    </TocPopoverContext>
  );
}

function PageTOCPopoverTrigger({
  className,
  ...props
}: ComponentProps<"button">) {
  const t = useTranslations({ note: "table of contents" });
  const { open } = use(TocPopoverContext)!;
  const items = Base.useItems();
  const selectedIdx = items.findIndex((item) => item.active);
  const path = useTreePath().at(-1);
  const showItem = selectedIdx !== -1 && !open;

  return (
    <CollapsibleTrigger
      className={cn(
        "flex h-10 w-full items-center gap-2.5 px-4 py-2.5 text-start text-sm text-muted-foreground focus-visible:outline-none md:px-6 [&_svg]:size-4",
        className,
      )}
      data-toc-popover-trigger=""
      {...props}
    >
      <ProgressCircle
        value={
          (findLastIndex(items, (item) => item.active) + 1) /
          Math.max(1, items.length)
        }
        max={1}
        className={cn("shrink-0", open && "text-primary")}
      />
      <span className="grid flex-1 *:col-start-1 *:row-start-1 *:my-auto">
        <span
          className={cn(
            "truncate transition-[opacity,translate,color]",
            open && "text-foreground",
            showItem && "pointer-events-none -translate-y-full opacity-0",
          )}
        >
          {path?.name ?? t("On this page")}
        </span>
        <span
          className={cn(
            "truncate transition-[opacity,translate]",
            !showItem && "pointer-events-none translate-y-full opacity-0",
          )}
        >
          {items[selectedIdx]?.original.title}
        </span>
      </span>
      <ChevronDown
        className={cn(
          "mx-0.5 shrink-0 transition-transform",
          open && "rotate-180",
        )}
      />
    </CollapsibleTrigger>
  );
}

interface ProgressCircleProps extends Omit<
  React.ComponentProps<"svg">,
  "strokeWidth"
> {
  value: number;
  strokeWidth?: number;
  size?: number;
  min?: number;
  max?: number;
}

function clamp(input: number, min: number, max: number): number {
  if (input < min) return min;
  if (input > max) return max;
  return input;
}

function ProgressCircle({
  value,
  strokeWidth = 1.5,
  size = 18,
  min = 0,
  max = 100,
  style,
  ...restSvgProps
}: ProgressCircleProps) {
  const normalizedValue = clamp(value, min, max);
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedValue / max) * circumference;
  const circleProps = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth,
  };

  return (
    <svg
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={normalizedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      style={{ width: size, height: size, ...style }}
      {...restSvgProps}
    >
      <circle {...circleProps} className="stroke-current/25" />
      <circle
        {...circleProps}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all"
      />
    </svg>
  );
}

function PageTOCPopoverContent(props: ComponentProps<"div">) {
  return (
    <CollapsibleContent data-toc-popover-content="" {...props}>
      <div className="flex max-h-[50vh] flex-col px-4 md:px-6">
        {props.children}
      </div>
    </CollapsibleContent>
  );
}
