// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { cn } from "cn";
import { X } from "lucide-react";
import { type HTMLAttributes, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

type BannerVariant = "rainbow" | "normal";

const noop = () => () => {};

export function Banner({
  id,
  variant = "normal",
  changeLayout = true,
  height = "3rem",
  rainbowColors = [
    "rgba(0,149,255,0.56)",
    "rgba(231,77,255,0.77)",
    "rgba(255,0,0,0.73)",
    "rgba(131,255,166,0.66)",
  ],
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * @defaultValue 3rem
   */
  height?: string;

  /**
   * @defaultValue 'normal'
   */
  variant?: BannerVariant;

  /**
   * For rainbow variant only, customize the colors
   */
  rainbowColors?: string[];

  /**
   * Offset docscn's layouts (sidebar, navbars and table of contents) by the
   * banner's height, through the `--docs-banner-height` variable
   *
   * @defaultValue true
   */
  changeLayout?: boolean;
}) {
  const globalKey = id ? `nd-banner-${encodeBase32(id)}` : null;
  const [closed, setClosed] = useState(false);
  // a banner closed on an earlier visit, `false` on the server
  const dismissed = useSyncExternalStore(
    noop,
    () => (globalKey ? localStorage.getItem(globalKey) === "true" : false),
    () => false,
  );

  function onClose() {
    setClosed(true);
    if (globalKey) localStorage.setItem(globalKey, "true");
    if (globalKey) document.documentElement.classList.add(globalKey);
  }

  if (closed || dismissed) return null;

  return (
    <div
      id={id}
      {...props}
      className={cn(
        "sticky top-0 z-40 flex flex-row items-center justify-center px-4 text-center text-sm font-medium",
        variant === "normal" && "bg-secondary text-secondary-foreground",
        variant === "rainbow" && "bg-background",
        props.className,
      )}
      style={{
        height,
      }}
    >
      {changeLayout ? (
        <style>
          {globalKey
            ? `:root:not(.${globalKey}) { --docs-banner-height: ${height}; }`
            : `:root { --docs-banner-height: ${height}; }`}
        </style>
      ) : null}
      {globalKey ? (
        <style>{`.${globalKey} #${id} { display: none; }`}</style>
      ) : null}
      {globalKey ? (
        // hide a dismissed banner before the page paints
        <script
          dangerouslySetInnerHTML={{
            __html: `if (localStorage.getItem('${globalKey}') === 'true') document.documentElement.classList.add('${globalKey}');`,
          }}
        />
      ) : null}

      {variant === "rainbow"
        ? flow({
            colors: rainbowColors,
          })
        : null}
      {props.children}
      {id ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close Banner"
          onClick={onClose}
          className="absolute inset-e-2 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}

const maskImage =
  "linear-gradient(to bottom,white,transparent), radial-gradient(circle at top center, white, transparent)";

function flow({ colors }: { colors: string[] }) {
  return (
    <>
      <div
        className="absolute inset-0 -z-1"
        style={{
          maskImage,
          maskComposite: "intersect",
          animation: "fd-moving-banner 20s linear infinite",
          backgroundImage: `repeating-linear-gradient(70deg, ${[...colors, colors[0]].map((color, i) => `${color} ${(i * 50) / colors.length}%`).join(", ")})`,
          backgroundSize: "200% 100%",
          filter: "saturate(2)",
        }}
      />
      <style>
        {`@keyframes fd-moving-banner {
            from { background-position: 0% 0;  }
            to { background-position: 100% 0;  }
         }`}
      </style>
    </>
  );
}

function encodeBase32(str: string) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  let encoded = "";

  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < str.length; i++) {
    buffer = (buffer << 8) | str.charCodeAt(i);
    bitsLeft += 8;

    while (bitsLeft >= 5) {
      bitsLeft -= 5;
      encoded += alphabet[(buffer >> bitsLeft) & 31];
    }
  }

  if (bitsLeft > 0) {
    encoded += alphabet[(buffer << (5 - bitsLeft)) & 31];
  }

  return encoded;
}
