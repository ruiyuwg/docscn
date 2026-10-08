"use client";

import { cn } from "cn";
import { RotateCcw } from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  baseColorOptions,
  basePrimary,
  fontOptions,
  type PreviewOptions,
  previewThemeCss,
  radiusOptions,
  swatch,
  type ThemeColorName,
  type ThemeName,
  themeOptions,
} from "./preview-themes";

const src = "/docs";
const styleId = "docscn-preview-theme";
/** The width the preview renders at on large screens, so the TOC column shows. */
const desktopWidth = 1280;
const defaultOptions: PreviewOptions = {
  baseColor: "neutral",
  theme: "default",
  radius: "0.625rem",
};

function applyTheme(frame: HTMLIFrameElement, css: string) {
  const doc = frame.contentDocument;
  if (!doc?.head) return;

  let style = doc.getElementById(styleId);
  if (!style) {
    style = doc.createElement("style");
    style.id = styleId;
    doc.head.append(style);
  }
  style.textContent = css;
}

function subscribeNever() {
  return () => {};
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * docscn.dev's own docs in an iframe, with controls that inject shadcn/ui
 * theme variables into it. The frame is same-origin, so it shares the site's
 * dark mode through next-themes' storage events.
 */
export function ThemePreview() {
  const [options, setOptions] = useState<PreviewOptions>(defaultOptions);
  const [size, setSize] = useState<{ width: number; height: number }>();
  const [loaded, setLoaded] = useState(false);
  // don't load the preview inside itself when the docs link back home
  const nested = useSyncExternalStore(
    subscribeNever,
    () => window.self !== window.top,
    () => false,
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const css = previewThemeCss(options);
  const isDefault =
    options.baseColor === defaultOptions.baseColor &&
    options.theme === defaultOptions.theme &&
    options.radius === defaultOptions.radius &&
    options.font === defaultOptions.font;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (frameRef.current) applyTheme(frameRef.current, css);
  }, [css]);

  // render the docs at desktop width and scale them down on large screens;
  // smaller screens get the real mobile or tablet layout at full size
  const scale =
    size && size.width >= 1024 ? Math.min(1, size.width / desktopWidth) : 1;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-start gap-2 border-b p-2">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Picker
            label="Base color"
            value={options.baseColor}
            onValueChange={(baseColor) =>
              setOptions((o) => ({ ...o, baseColor }))
            }
            items={baseColorOptions.map((baseColor) => ({
              value: baseColor,
              label: capitalize(baseColor),
              icon: <Swatch light={swatch(baseColor)} />,
            }))}
          />
          <Picker<ThemeName>
            label="Theme"
            value={options.theme}
            onValueChange={(theme) => setOptions((o) => ({ ...o, theme }))}
            items={themeOptions.map((theme) =>
              theme === "default"
                ? {
                    value: theme,
                    label: capitalize(options.baseColor),
                    icon: <Swatch {...basePrimary(options.baseColor)} />,
                  }
                : {
                    value: theme,
                    label: capitalize(theme),
                    icon: <Swatch light={swatch(theme as ThemeColorName)} />,
                  },
            )}
          />
          <Picker
            label="Radius"
            value={options.radius}
            onValueChange={(radius) => setOptions((o) => ({ ...o, radius }))}
            items={radiusOptions.map((option) => ({
              value: option.value,
              label: option.label,
              detail: option.value,
              icon: <RadiusIcon radius={option.value} />,
            }))}
          />
          <Picker
            label="Font"
            value={options.font ?? "sans"}
            onValueChange={(font) =>
              setOptions((o) => ({
                ...o,
                font: font === "sans" ? undefined : font,
              }))
            }
            items={fontOptions.map((option) => ({
              value: option.value ?? "sans",
              label: option.label,
              icon: <FontIcon font={option.value} />,
            }))}
          />
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                disabled={isDefault}
                onClick={() => setOptions(defaultOptions)}
              />
            }
          >
            <RotateCcw />
            <span className="sr-only">Reset theme</span>
          </TooltipTrigger>
          <TooltipContent>Reset theme</TooltipContent>
        </Tooltip>
      </div>
      <div
        ref={viewportRef}
        className="relative h-[560px] overflow-hidden bg-background md:h-[640px]"
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-muted/50" />
        )}
        {size && !nested && (
          <iframe
            ref={frameRef}
            src={src}
            title="docscn documentation, themed with the controls above"
            loading="lazy"
            onLoad={(e) => {
              applyTheme(e.currentTarget, css);
              setLoaded(true);
            }}
            className={cn(
              "absolute top-0 left-0 origin-top-left transition-opacity",
              !loaded && "opacity-0",
            )}
            style={{
              width: scale < 1 ? desktopWidth : "100%",
              height: size.height / scale,
              transform: scale < 1 ? `scale(${scale})` : undefined,
            }}
          />
        )}
      </div>
    </div>
  );
}

interface PickerItem<T extends string> {
  value: T;
  label: string;
  /** shown after the label in the menu, e.g. the radius in rem */
  detail?: string;
  icon: ReactNode;
}

function Picker<T extends string>({
  label,
  value,
  onValueChange,
  items,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  items: PickerItem<T>[];
}) {
  const selected = items.find((item) => item.value === value);

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next as T);
      }}
    >
      <SelectTrigger size="sm" className="bg-background">
        <span className="text-muted-foreground max-sm:sr-only">{label}</span>
        <SelectValue>
          {() =>
            selected && (
              <>
                {selected.icon}
                {selected.label}
              </>
            )
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
                {item.detail && (
                  <span className="text-muted-foreground">{item.detail}</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/** A colour dot, with an optional different colour in dark mode. */
function Swatch({ light, dark = light }: { light: string; dark?: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-3.5 shrink-0 rounded-full bg-(--swatch-light) ring-1 ring-foreground/15 ring-inset dark:bg-(--swatch-dark)"
      style={
        { "--swatch-light": light, "--swatch-dark": dark } as CSSProperties
      }
    />
  );
}

function RadiusIcon({ radius }: { radius: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-3.5 shrink-0 border-t-2 border-l-2 border-current text-muted-foreground"
      style={{ borderTopLeftRadius: `calc(${radius} * 0.75)` }}
    />
  );
}

function FontIcon({ font }: { font?: string }) {
  return (
    <span
      aria-hidden="true"
      className="w-4 shrink-0 text-center text-xs font-medium text-muted-foreground"
      style={{ fontFamily: font }}
    >
      Aa
    </span>
  );
}
