import type { ComponentProps } from "react";

/** The squares that make up the docscn mark, on a 24×24 grid. */
export const markPaths = [
  "M16 0H24V8H16V0Z",
  "M8 8H16V16H8V8Z",
  "M0 16H8V24H0V16Z",
  "M16 16H24V24H16V16Z",
];

/** The docscn mark, in the current text colour. */
export function Logo(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {markPaths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
