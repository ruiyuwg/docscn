// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import { cn } from "cn";
import {
  CircleCheck,
  CircleX,
  Info,
  Lightbulb,
  TriangleAlert,
} from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type CalloutType =
  "info" | "warn" | "error" | "success" | "warning" | "idea";

const colors = {
  info: "oklch(62.3% 0.214 259.815)",
  warning: "oklch(76.9% 0.188 70.08)",
  error: "var(--destructive)",
  success: "oklch(72.3% 0.219 149.579)",
  idea: "oklch(70.5% 0.209 60.849)",
};

const icons = {
  info: <Info />,
  warning: <TriangleAlert />,
  error: <CircleX />,
  success: <CircleCheck />,
  idea: <Lightbulb />,
};

export function Callout({
  children,
  title,
  ...props
}: { title?: ReactNode } & Omit<CalloutContainerProps, "title">) {
  return (
    <CalloutContainer {...props}>
      {title && <CalloutTitle>{title}</CalloutTitle>}
      <CalloutDescription>{children}</CalloutDescription>
    </CalloutContainer>
  );
}

export interface CalloutContainerProps extends ComponentProps<"div"> {
  /**
   * @defaultValue info
   */
  type?: CalloutType;

  /**
   * Force an icon
   */
  icon?: ReactNode;
}

function resolveAlias(type: CalloutType) {
  if (type === "warn") return "warning";
  if ((type as unknown) === "tip") return "info";
  return type;
}

export function CalloutContainer({
  type: inputType = "info",
  icon,
  children,
  className,
  style,
  ...props
}: CalloutContainerProps) {
  const type = resolveAlias(inputType);

  return (
    <Alert
      role="note"
      data-type={type}
      className={cn(
        "my-4 px-3 py-2.5 *:[svg]:text-(--callout-color)",
        className,
      )}
      style={
        {
          "--callout-color": colors[type] ?? "var(--muted-foreground)",
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {icon ?? icons[type]}
      <div className="col-start-2 flex min-w-0 flex-col gap-1">{children}</div>
    </Alert>
  );
}

export function CalloutTitle({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <AlertTitle className={className} {...props}>
      {children}
    </AlertTitle>
  );
}

export function CalloutDescription({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <AlertDescription
      className={cn("*:first:mt-0 *:last:mb-0 empty:hidden", className)}
      {...props}
    >
      {children}
    </AlertDescription>
  );
}
