// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import { cn } from "cn";
import Link from "fumadocs-core/link";
import type { HTMLAttributes, ReactNode } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as CardRoot,
} from "@/components/ui/card";

export function Cards(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("@container my-6 grid grid-cols-2 gap-3", props.className)}
    >
      {props.children}
    </div>
  );
}

export type CardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;

  href?: string;
  external?: boolean;
};

export function Card({
  icon,
  title,
  description,
  className,
  children,
  href,
  external,
  ...props
}: CardProps) {
  const content = (
    <>
      <CardHeader>
        {icon ? (
          <div className="mb-1 w-fit rounded-lg border bg-muted p-1.5 text-muted-foreground shadow-xs [&_svg]:size-4">
            {icon}
          </div>
        ) : null}
        <CardTitle className="text-sm">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {children ? (
        <CardContent className="text-muted-foreground *:first:mt-0 *:last:mb-0">
          {children}
        </CardContent>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        external={external}
        {...props}
        data-card=""
        className={cn(
          "group/docs-card block rounded-xl @max-lg:col-span-full",
          className,
        )}
      >
        <CardRoot
          size="sm"
          className="h-full transition-colors group-hover/docs-card:bg-accent/80"
        >
          {content}
        </CardRoot>
      </Link>
    );
  }

  return (
    <CardRoot
      size="sm"
      {...props}
      data-card=""
      className={cn("@max-lg:col-span-full", className)}
    >
      {content}
    </CardRoot>
  );
}
