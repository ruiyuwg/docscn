"use client";

import { cn } from "cn";
import { ExternalLink } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type AccentName,
  accentOptions,
  fontOptions,
  type GrayName,
  grayOptions,
  type PreviewTheme,
  previewThemeCss,
  radiusOptions,
  swatch,
} from "./preview-themes";

const src = "/docs";
const styleId = "docscn-preview-theme";
/** The width the preview renders at on large screens, so the TOC column shows. */
const desktopWidth = 1280;

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
  const [theme, setTheme] = useState<PreviewTheme>({
    gray: "neutral",
    accent: "none",
    radius: "0.625rem",
  });
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
  const css = previewThemeCss(theme);

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
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-4 py-3">
        <Control label="Gray">
          <ToggleGroup
            size="sm"
            spacing={0}
            value={[theme.gray]}
            onValueChange={([gray]) => {
              if (gray) setTheme((t) => ({ ...t, gray: gray as GrayName }));
            }}
          >
            {grayOptions.map((gray) => (
              <SwatchItem key={gray} value={gray} label={capitalize(gray)} />
            ))}
          </ToggleGroup>
        </Control>
        <Control label="Accent">
          <ToggleGroup
            size="sm"
            spacing={0}
            value={[theme.accent]}
            onValueChange={([accent]) => {
              if (accent)
                setTheme((t) => ({ ...t, accent: accent as AccentName }));
            }}
          >
            {accentOptions.map((accent) => (
              <SwatchItem
                key={accent}
                value={accent}
                label={accent === "none" ? "None" : capitalize(accent)}
              />
            ))}
          </ToggleGroup>
        </Control>
        <Control label="Radius">
          <ToggleGroup
            size="sm"
            variant="outline"
            spacing={0}
            value={[theme.radius]}
            onValueChange={([radius]) => {
              if (radius) setTheme((t) => ({ ...t, radius }));
            }}
          >
            {radiusOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={`Radius ${option.label}rem`}
                className="font-mono text-xs"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Control>
        <Control label="Font">
          <ToggleGroup
            size="sm"
            variant="outline"
            spacing={0}
            value={[theme.font ?? "sans"]}
            onValueChange={([font]) => {
              if (font)
                setTheme((t) => ({
                  ...t,
                  font: font === "sans" ? undefined : font,
                }));
            }}
          >
            {fontOptions.map((option) => (
              <ToggleGroupItem
                key={option.label}
                value={option.value ?? "sans"}
                className="text-xs"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Control>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "ms-auto text-muted-foreground",
          )}
        >
          <ExternalLink />
          <span className="sr-only">Open the docs in a new tab</span>
        </a>
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

function Control({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function SwatchItem({ value, label }: { value: string; label: string }) {
  return (
    <ToggleGroupItem
      value={value}
      aria-label={label}
      title={label}
      className="size-7 min-w-7 px-0"
    >
      <span
        className={cn(
          "size-4 rounded-full border border-black/10 dark:border-white/15",
          value === "none" && "bg-foreground",
        )}
        style={
          value === "none"
            ? undefined
            : {
                backgroundColor: swatch(
                  value as Exclude<GrayName | AccentName, "none">,
                ),
              }
        }
      />
    </ToggleGroupItem>
  );
}
