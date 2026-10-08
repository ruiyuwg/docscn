// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useTranslations } from "@fuma-translate/react";
import { cn } from "cn";
import { Check, LinkIcon } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AccordionContent,
  AccordionItem,
  Accordion as AccordionRoot,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { mergeRefs } from "../utils/merge-refs";
import { useCopyButton } from "../utils/use-copy-button";

type WithStringClassName<T> = Omit<T, "className"> & { className?: string };

export function Accordions({
  ref,
  className,
  defaultValue,
  ...props
}: WithStringClassName<ComponentProps<typeof AccordionRoot>>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<unknown[]>(defaultValue ?? []);

  // open the item the URL hash points to
  useEffect(() => {
    function openFromHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const element = rootRef.current;
      if (!element || id.length === 0) return;

      const selected = document.getElementById(id);
      if (!selected || !element.contains(selected)) return;
      const itemValue = selected.getAttribute("data-accordion-value");
      if (itemValue)
        setValue((prev) =>
          prev.includes(itemValue) ? prev : [itemValue, ...prev],
        );
    }

    const frame = requestAnimationFrame(openFromHash);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, []);

  return (
    <AccordionRoot
      ref={mergeRefs(ref, rootRef)}
      value={value}
      onValueChange={setValue}
      className={cn(
        "my-4 overflow-hidden rounded-xl border bg-card",
        className,
      )}
      {...props}
    />
  );
}

export function Accordion({
  title,
  id,
  value = String(title),
  children,
  className,
  ...props
}: Omit<
  WithStringClassName<ComponentProps<typeof AccordionItem>>,
  "value" | "title"
> & {
  title: string | ReactNode;
  value?: string;
}) {
  return (
    <AccordionItem
      value={value}
      id={id}
      data-accordion-value={value}
      // the header is an <h3>; keep docs-typeset heading styles off it
      className={cn(
        "relative scroll-m-28 [&>h3]:m-0 [&>h3]:tracking-normal",
        className,
      )}
      {...props}
    >
      <AccordionTrigger className="px-4 py-3">
        {/* leave room for the copy button beside the chevron */}
        <span className={cn(id && "pe-8")}>{title}</span>
      </AccordionTrigger>
      {id ? <CopyButton id={id} /> : null}
      <AccordionContent hiddenUntilFound>
        <div className="px-4 pb-2 text-[0.9375rem] *:first:mt-0 *:last:mb-0">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function CopyButton({ id }: { id: string }) {
  const t = useTranslations({ note: "accordion" });
  const [checked, onClick] = useCopyButton(() => {
    const url = new URL(window.location.href);
    url.hash = id;

    return navigator.clipboard.writeText(url.toString());
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-live="polite"
      className="absolute end-10 top-2.5 text-muted-foreground"
      onClick={onClick}
    >
      {checked ? <Check /> : <LinkIcon />}
      <span className="sr-only">
        {checked
          ? t("Copied Link", { note: "aria-label" })
          : t("Copy Link", { note: "aria-label" })}
      </span>
    </Button>
  );
}
