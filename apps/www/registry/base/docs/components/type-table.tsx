// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useTranslations } from "@fuma-translate/react";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import Link from "fumadocs-core/link";
import { ChevronDown } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface ParameterNode {
  name: string;
  description: ReactNode;
}

export interface TypeNode {
  /**
   * Additional description of the field
   */
  description?: ReactNode;

  /**
   * type signature (short)
   */
  type: ReactNode;

  /**
   * type signature (full)
   */
  typeDescription?: ReactNode;

  /**
   * Optional `href` for the type
   */
  typeDescriptionLink?: string;

  default?: ReactNode;

  required?: boolean;
  deprecated?: boolean;

  /**
   * a list of parameters info if the type is a function.
   */
  parameters?: ParameterNode[];

  returns?: ReactNode;
}

const fieldVariants = cva("not-docs-typeset pe-2 text-muted-foreground");
const proseVariants = cva("text-sm *:first:mt-0 *:last:mb-0");

export function TypeTable({
  id,
  type,
  className,
  ...props
}: { type: Record<string, TypeNode> } & ComponentProps<"div">) {
  const t = useTranslations({ note: "type table" });

  return (
    <div
      id={id}
      className={cn(
        "@container my-6 flex flex-col overflow-hidden rounded-2xl border bg-card p-1 text-sm text-card-foreground",
        className,
      )}
      {...props}
    >
      <div className="not-docs-typeset flex items-center px-3 py-1 font-medium text-muted-foreground">
        <p className="w-1/4">{t("Prop")}</p>
        <p className="@max-xl:hidden">{t("Type")}</p>
      </div>
      {Object.entries(type).map(([key, value]) => (
        <Item key={key} parentId={id} name={key} item={value} />
      ))}
    </div>
  );
}

function Item({
  parentId,
  name,
  item: {
    parameters = [],
    description,
    required = false,
    deprecated,
    typeDescription,
    default: defaultValue,
    type,
    typeDescriptionLink,
    returns,
  },
}: {
  parentId?: string;
  name: string;
  item: TypeNode;
}) {
  const t = useTranslations({ note: "type table" });
  const [open, setOpen] = useState(false);
  const id = parentId ? `${parentId}-${name}` : undefined;

  // open the field the URL hash points to
  useEffect(() => {
    if (!id) return;
    function openFromHash() {
      if (window.location.hash === `#${id}`) setOpen(true);
    }

    const frame = requestAnimationFrame(openFromHash);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [id]);

  return (
    <Collapsible
      id={id}
      open={open}
      onOpenChange={(v) => {
        if (v && id) {
          window.history.replaceState(null, "", `#${id}`);
        }
        setOpen(v);
      }}
      className={cn(
        "scroll-m-20 overflow-hidden rounded-xl border transition-all",
        open ? "bg-background shadow-xs not-last:mb-2" : "border-transparent",
      )}
    >
      <CollapsibleTrigger className="group not-docs-typeset relative flex w-full flex-row items-center px-3 py-2 text-start outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
        <code
          className={cn(
            "w-1/4 min-w-fit pe-2 font-mono font-medium text-foreground",
            deprecated && "text-muted-foreground line-through",
          )}
        >
          {name}
          {!required && "?"}
        </code>
        {typeDescriptionLink ? (
          <Link href={typeDescriptionLink} className="underline @max-xl:hidden">
            {type}
          </Link>
        ) : (
          <span className="@max-xl:hidden">{type}</span>
        )}
        <ChevronDown className="absolute inset-e-2 size-4 text-muted-foreground transition-transform group-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid [scrollbar-width:thin] grid-cols-[1fr_3fr] gap-y-4 overflow-auto border-t p-3 text-sm">
          <div className={cn(proseVariants(), "col-span-full empty:hidden")}>
            {description}
          </div>
          {typeDescription && (
            <>
              <p className={cn(fieldVariants())}>{t("Type")}</p>
              <p className="not-docs-typeset my-auto">{typeDescription}</p>
            </>
          )}
          {defaultValue && (
            <>
              <p className={cn(fieldVariants())}>{t("Default")}</p>
              <p className="not-docs-typeset my-auto">{defaultValue}</p>
            </>
          )}
          {parameters.length > 0 && (
            <>
              <p className={cn(fieldVariants())}>{t("Parameters")}</p>
              <div className="flex flex-col gap-2">
                {parameters.map((param) => (
                  <div
                    key={param.name}
                    className="inline-flex flex-wrap items-center gap-1"
                  >
                    <p className="not-docs-typeset font-medium text-nowrap">
                      {param.name} -
                    </p>
                    <div className={proseVariants()}>{param.description}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {returns && (
            <>
              <p className={cn(fieldVariants())}>{t("Returns")}</p>
              <div className={cn(proseVariants(), "my-auto")}>{returns}</div>
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
