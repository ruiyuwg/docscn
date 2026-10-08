/**
 * Theme presets for the landing page's live preview. Each one is a set of
 * shadcn/ui theme variables, mapped from a Tailwind gray and an optional accent
 * the way shadcn/ui maps its neutral theme.
 */

type Scale = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  string
>;

const grays = {
  neutral: {
    50: "oklch(0.985 0 0)",
    100: "oklch(0.97 0 0)",
    200: "oklch(0.922 0 0)",
    300: "oklch(0.87 0 0)",
    400: "oklch(0.708 0 0)",
    500: "oklch(0.556 0 0)",
    600: "oklch(0.439 0 0)",
    700: "oklch(0.371 0 0)",
    800: "oklch(0.269 0 0)",
    900: "oklch(0.205 0 0)",
    950: "oklch(0.145 0 0)",
  },
  stone: {
    50: "oklch(0.985 0.001 106.423)",
    100: "oklch(0.97 0.001 106.424)",
    200: "oklch(0.923 0.003 48.717)",
    300: "oklch(0.869 0.005 56.366)",
    400: "oklch(0.709 0.01 56.259)",
    500: "oklch(0.553 0.013 58.071)",
    600: "oklch(0.444 0.011 73.639)",
    700: "oklch(0.374 0.01 67.558)",
    800: "oklch(0.268 0.007 34.298)",
    900: "oklch(0.216 0.006 56.043)",
    950: "oklch(0.147 0.004 49.25)",
  },
  zinc: {
    50: "oklch(0.985 0 0)",
    100: "oklch(0.967 0.001 286.375)",
    200: "oklch(0.92 0.004 286.32)",
    300: "oklch(0.871 0.006 286.286)",
    400: "oklch(0.705 0.015 286.067)",
    500: "oklch(0.552 0.016 285.938)",
    600: "oklch(0.442 0.017 285.786)",
    700: "oklch(0.37 0.013 285.805)",
    800: "oklch(0.274 0.006 286.033)",
    900: "oklch(0.21 0.006 285.885)",
    950: "oklch(0.141 0.005 285.823)",
  },
  slate: {
    50: "oklch(0.984 0.003 247.858)",
    100: "oklch(0.968 0.007 247.896)",
    200: "oklch(0.929 0.013 255.508)",
    300: "oklch(0.869 0.022 252.894)",
    400: "oklch(0.704 0.04 256.788)",
    500: "oklch(0.554 0.046 257.417)",
    600: "oklch(0.446 0.043 257.281)",
    700: "oklch(0.372 0.044 257.287)",
    800: "oklch(0.279 0.041 260.031)",
    900: "oklch(0.208 0.042 265.755)",
    950: "oklch(0.129 0.042 264.695)",
  },
  olive: {
    50: "oklch(0.988 0.003 106.5)",
    100: "oklch(0.966 0.005 106.5)",
    200: "oklch(0.93 0.007 106.5)",
    300: "oklch(0.88 0.011 106.6)",
    400: "oklch(0.737 0.021 106.9)",
    500: "oklch(0.58 0.031 107.3)",
    600: "oklch(0.466 0.025 107.3)",
    700: "oklch(0.394 0.023 107.4)",
    800: "oklch(0.286 0.016 107.4)",
    900: "oklch(0.228 0.013 107.4)",
    950: "oklch(0.153 0.006 107.1)",
  },
} satisfies Record<string, Scale>;

type AccentScale = Pick<Scale, 50 | 100 | 300 | 400 | 500 | 600 | 700 | 950>;

const accents = {
  blue: {
    50: "oklch(0.97 0.014 254.604)",
    100: "oklch(0.932 0.032 255.585)",
    300: "oklch(0.809 0.105 251.813)",
    400: "oklch(0.707 0.165 254.624)",
    500: "oklch(0.623 0.214 259.815)",
    600: "oklch(0.546 0.245 262.881)",
    700: "oklch(0.488 0.243 264.376)",
    950: "oklch(0.282 0.091 267.935)",
  },
  emerald: {
    50: "oklch(0.979 0.021 166.113)",
    100: "oklch(0.95 0.052 163.051)",
    300: "oklch(0.845 0.143 164.978)",
    400: "oklch(0.765 0.177 163.223)",
    500: "oklch(0.696 0.17 162.48)",
    600: "oklch(0.596 0.145 163.225)",
    700: "oklch(0.508 0.118 165.612)",
    950: "oklch(0.262 0.051 172.552)",
  },
  orange: {
    50: "oklch(0.98 0.016 73.684)",
    100: "oklch(0.954 0.038 75.164)",
    300: "oklch(0.837 0.128 66.29)",
    400: "oklch(0.75 0.183 55.934)",
    500: "oklch(0.705 0.213 47.604)",
    600: "oklch(0.646 0.222 41.116)",
    700: "oklch(0.553 0.195 38.402)",
    950: "oklch(0.266 0.079 36.259)",
  },
  rose: {
    50: "oklch(0.969 0.015 12.422)",
    100: "oklch(0.941 0.03 12.58)",
    300: "oklch(0.81 0.117 11.638)",
    400: "oklch(0.712 0.194 13.428)",
    500: "oklch(0.645 0.246 16.439)",
    600: "oklch(0.586 0.253 17.585)",
    700: "oklch(0.514 0.222 16.935)",
    950: "oklch(0.271 0.105 12.094)",
  },
  violet: {
    50: "oklch(0.969 0.016 293.756)",
    100: "oklch(0.943 0.029 294.588)",
    300: "oklch(0.811 0.111 293.571)",
    400: "oklch(0.702 0.183 293.541)",
    500: "oklch(0.606 0.25 292.717)",
    600: "oklch(0.541 0.281 293.009)",
    700: "oklch(0.491 0.27 292.581)",
    950: "oklch(0.283 0.141 291.089)",
  },
} satisfies Record<string, AccentScale>;

export type GrayName = keyof typeof grays;
export type AccentName = keyof typeof accents | "none";

export const grayOptions = Object.keys(grays) as GrayName[];
export const accentOptions = ["none", ...Object.keys(accents)] as AccentName[];

/** A colour to show on an option's swatch. */
export function swatch(option: GrayName | keyof typeof accents) {
  if (option in grays) return grays[option as GrayName][500];
  return accents[option as keyof typeof accents][500];
}

export const radiusOptions = [
  { label: "0", value: "0rem" },
  { label: "0.3", value: "0.3rem" },
  { label: "0.625", value: "0.625rem" },
  { label: "1", value: "1rem" },
];

export const fontOptions = [
  { label: "Sans", value: undefined },
  {
    label: "Serif",
    value: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  },
  {
    label: "Mono",
    value: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
];

export interface PreviewTheme {
  gray: GrayName;
  accent: AccentName;
  radius: string;
  font?: string;
}

type Variables = Record<string, string>;

function lightVariables(g: Scale, a?: AccentScale): Variables {
  return {
    "--background": "oklch(1 0 0)",
    "--foreground": g[950],
    "--card": "oklch(1 0 0)",
    "--card-foreground": g[950],
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": g[950],
    "--primary": a ? a[600] : g[900],
    "--primary-foreground": a ? a[50] : g[50],
    "--secondary": g[100],
    "--secondary-foreground": g[900],
    "--muted": g[100],
    "--muted-foreground": g[500],
    "--accent": g[100],
    "--accent-foreground": g[900],
    "--border": g[200],
    "--input": g[200],
    "--ring": a ? a[400] : g[400],
    "--sidebar": g[50],
    "--sidebar-foreground": g[950],
    "--sidebar-primary": a ? a[600] : g[900],
    "--sidebar-primary-foreground": a ? a[50] : g[50],
    "--sidebar-accent": a ? a[100] : g[100],
    "--sidebar-accent-foreground": a ? a[700] : g[900],
    "--sidebar-border": g[200],
    "--sidebar-ring": a ? a[400] : g[400],
  };
}

function darkVariables(g: Scale, a?: AccentScale): Variables {
  return {
    "--background": g[950],
    "--foreground": g[50],
    "--card": g[900],
    "--card-foreground": g[50],
    "--popover": g[900],
    "--popover-foreground": g[50],
    "--primary": a ? a[500] : g[200],
    "--primary-foreground": a ? a[50] : g[900],
    "--secondary": g[800],
    "--secondary-foreground": g[50],
    "--muted": g[800],
    "--muted-foreground": g[400],
    "--accent": g[800],
    "--accent-foreground": g[50],
    "--border": "oklch(1 0 0 / 10%)",
    "--input": "oklch(1 0 0 / 15%)",
    "--ring": a ? a[500] : g[500],
    "--sidebar": g[900],
    "--sidebar-foreground": g[50],
    "--sidebar-primary": a ? a[500] : g[200],
    "--sidebar-primary-foreground": a ? a[50] : g[900],
    "--sidebar-accent": a ? a[950] : g[800],
    "--sidebar-accent-foreground": a ? a[300] : g[50],
    "--sidebar-border": "oklch(1 0 0 / 10%)",
    "--sidebar-ring": a ? a[500] : g[500],
  };
}

function block(selector: string, variables: Variables) {
  const lines = Object.entries(variables).map(
    ([name, value]) => `  ${name}: ${value};`,
  );
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/**
 * The preview theme as CSS. The selectors beat the site's own `:root` and
 * `.dark` rules, so the order of stylesheets in the document doesn't matter.
 */
export function previewThemeCss(theme: PreviewTheme) {
  const g = grays[theme.gray];
  const a = theme.accent === "none" ? undefined : accents[theme.accent];

  return [
    block("html:root", {
      ...lightVariables(g, a),
      "--radius": theme.radius,
      ...(theme.font ? { "--font-sans": theme.font } : {}),
    }),
    block("html.dark", darkVariables(g, a)),
  ].join("\n");
}
