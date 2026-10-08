// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useTranslations } from "@fuma-translate/react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "../../../contexts/i18n";

export interface LanguageSelectProps extends ComponentProps<"button"> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function LanguageSelect({
  className,
  variant = "ghost",
  children,
  ...rest
}: LanguageSelectProps): React.ReactElement {
  const context = useI18n();
  const t = useTranslations({ note: "language switcher" });
  if (!context.locales) throw new Error("Missing `<I18nProvider />`");

  const chooseLanguage = t("Choose a language");

  return (
    <Popover>
      <PopoverTrigger
        aria-label={t("Choose a language", { note: "aria-label" })}
        className={cn(
          buttonVariants({ variant }),
          "gap-1.5 px-2 data-popup-open:bg-accent data-popup-open:text-accent-foreground",
          className,
        )}
        {...rest}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-40 gap-0.5 p-1">
        <p className="p-2 text-xs font-medium text-muted-foreground">
          {chooseLanguage}
        </p>
        {context.locales.map((item) => (
          <button
            key={item.locale}
            type="button"
            className={cn(
              "rounded-md px-2 py-1.5 text-start text-sm transition-colors",
              item.locale === context.locale
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => {
              context.onChange?.(item.locale);
            }}
          >
            {item.name}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export type LanguageSelectTextProps = ComponentProps<"span">;

export function LanguageSelectText(props: LanguageSelectTextProps) {
  const { locales, locale } = useI18n();
  const text = locales?.find((item) => item.locale === locale)?.name;

  return <span {...props}>{text}</span>;
}
