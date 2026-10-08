// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useTranslations } from "@fuma-translate/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import Link from "fumadocs-core/link";
import { HomeIcon } from "lucide-react";

/**
 * the default not found page content, please make your own if you want to customize it.
 */
export function DefaultNotFound() {
  const t = useTranslations({ note: "404 not found page" });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-2xl font-semibold">{t("Page Not Found")}</h2>
      <p className="max-w-md text-muted-foreground">
        {t(
          "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
        )}
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({
            className: "mt-4 gap-1.5",
            variant: "default",
          }),
        )}
      >
        <HomeIcon className="size-4" />
        {t("Back to Home")}
      </Link>
    </div>
  );
}
