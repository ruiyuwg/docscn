/**
 * Theme presets for the landing page's live preview, following shadcn/ui's
 * theming (https://ui.shadcn.com/docs/theming). A base color sets every token
 * the way shadcn/ui's registry does (`/r/colors/{name}.json`), and a primary
 * color changes only `primary`, `primary-foreground` and `ring` (and their
 * sidebar equivalents), like shadcn/ui's color themes.
 */

type Scale = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  string
>;

/** shadcn/ui's base colors, from Tailwind's palette. */
const baseColors = {
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
  mauve: {
    50: "oklch(0.985 0 0)",
    100: "oklch(0.96 0.003 325.6)",
    200: "oklch(0.922 0.005 325.62)",
    300: "oklch(0.865 0.012 325.68)",
    400: "oklch(0.711 0.019 323.02)",
    500: "oklch(0.542 0.034 322.5)",
    600: "oklch(0.435 0.029 321.78)",
    700: "oklch(0.364 0.029 323.89)",
    800: "oklch(0.263 0.024 320.12)",
    900: "oklch(0.212 0.019 322.12)",
    950: "oklch(0.145 0.008 326)",
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
  mist: {
    50: "oklch(0.987 0.002 197.1)",
    100: "oklch(0.963 0.002 197.1)",
    200: "oklch(0.925 0.005 214.3)",
    300: "oklch(0.872 0.007 219.6)",
    400: "oklch(0.723 0.014 214.4)",
    500: "oklch(0.56 0.021 213.5)",
    600: "oklch(0.45 0.017 213.2)",
    700: "oklch(0.378 0.015 216)",
    800: "oklch(0.275 0.011 216.9)",
    900: "oklch(0.218 0.008 223.9)",
    950: "oklch(0.148 0.004 228.8)",
  },
  taupe: {
    50: "oklch(0.986 0.002 67.8)",
    100: "oklch(0.96 0.002 17.2)",
    200: "oklch(0.922 0.005 34.3)",
    300: "oklch(0.868 0.007 39.5)",
    400: "oklch(0.714 0.014 41.2)",
    500: "oklch(0.547 0.021 43.1)",
    600: "oklch(0.438 0.017 39.3)",
    700: "oklch(0.367 0.016 35.7)",
    800: "oklch(0.268 0.011 36.5)",
    900: "oklch(0.214 0.009 43.1)",
    950: "oklch(0.147 0.004 49.3)",
  },
} satisfies Record<string, Scale>;

interface PrimaryColor {
  /** `primary` and `primary-foreground` in light mode */
  light: { primary: string; foreground: string };
  /** `primary` in dark mode, with the base color's darkest shade as foreground */
  dark: string;
}

/**
 * Primary colors from Tailwind's palette. The shades are picked so that
 * `primary-foreground` on `primary` meets WCAG AA (4.5:1) in both modes.
 */
const primaryColors = {
  blue: {
    light: {
      primary: "oklch(0.546 0.245 262.881)", // blue-600
      foreground: "oklch(0.97 0.014 254.604)", // blue-50
    },
    dark: "oklch(0.623 0.214 259.815)", // blue-500
  },
  emerald: {
    light: {
      primary: "oklch(0.508 0.118 165.612)", // emerald-700
      foreground: "oklch(0.979 0.021 166.113)", // emerald-50
    },
    dark: "oklch(0.696 0.17 162.48)", // emerald-500
  },
  orange: {
    light: {
      primary: "oklch(0.553 0.195 38.402)", // orange-700
      foreground: "oklch(0.98 0.016 73.684)", // orange-50
    },
    dark: "oklch(0.705 0.213 47.604)", // orange-500
  },
  rose: {
    light: {
      primary: "oklch(0.514 0.222 16.935)", // rose-700
      foreground: "oklch(0.969 0.015 12.422)", // rose-50
    },
    dark: "oklch(0.645 0.246 16.439)", // rose-500
  },
  violet: {
    light: {
      primary: "oklch(0.541 0.281 293.009)", // violet-600
      foreground: "oklch(0.969 0.016 293.756)", // violet-50
    },
    dark: "oklch(0.702 0.183 293.541)", // violet-400
  },
} satisfies Record<string, PrimaryColor>;

/** shadcn/ui's dark `sidebar-primary`, the same for every base color. */
const darkSidebarPrimary = "oklch(0.488 0.243 264.376)";

export type BaseColorName = keyof typeof baseColors;
export type PrimaryColorName = keyof typeof primaryColors;
export type PrimaryName = PrimaryColorName | "default";

export const baseColorOptions = Object.keys(baseColors) as BaseColorName[];
export const primaryOptions = [
  "default",
  ...Object.keys(primaryColors),
] as PrimaryName[];

/** A colour to show on an option's swatch. */
export function swatch(option: BaseColorName | PrimaryColorName) {
  if (option in baseColors) return baseColors[option as BaseColorName][500];
  return primaryColors[option as PrimaryColorName].light.primary;
}

export const radiusOptions = [
  { label: "0", value: "0rem" },
  { label: "0.3", value: "0.3rem" },
  { label: "0.625", value: "0.625rem" },
  { label: "1", value: "1rem" },
];

/**
 * Not a shadcn/ui theme token: this overrides the `--font-sans` variable that
 * docscn.dev's `next/font` setup defines.
 */
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
  baseColor: BaseColorName;
  primary: PrimaryName;
  radius: string;
  font?: string;
}

type Variables = Record<string, string>;

function lightVariables(g: Scale, p?: PrimaryColor): Variables {
  const primary = p?.light.primary ?? g[900];
  const primaryForeground = p?.light.foreground ?? g[50];
  const ring = p?.light.primary ?? g[400];

  return {
    "--background": "oklch(1 0 0)",
    "--foreground": g[950],
    "--card": "oklch(1 0 0)",
    "--card-foreground": g[950],
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": g[950],
    "--primary": primary,
    "--primary-foreground": primaryForeground,
    "--secondary": g[100],
    "--secondary-foreground": g[900],
    "--muted": g[100],
    "--muted-foreground": g[500],
    "--accent": g[100],
    "--accent-foreground": g[900],
    "--border": g[200],
    "--input": g[200],
    "--ring": ring,
    "--sidebar": g[50],
    "--sidebar-foreground": g[950],
    "--sidebar-primary": primary,
    "--sidebar-primary-foreground": primaryForeground,
    "--sidebar-accent": g[100],
    "--sidebar-accent-foreground": g[900],
    "--sidebar-border": g[200],
    "--sidebar-ring": ring,
  };
}

function darkVariables(g: Scale, p?: PrimaryColor): Variables {
  const ring = p?.dark ?? g[500];

  return {
    "--background": g[950],
    "--foreground": g[50],
    "--card": g[900],
    "--card-foreground": g[50],
    "--popover": g[900],
    "--popover-foreground": g[50],
    "--primary": p?.dark ?? g[200],
    "--primary-foreground": p ? g[950] : g[900],
    "--secondary": g[800],
    "--secondary-foreground": g[50],
    "--muted": g[800],
    "--muted-foreground": g[400],
    "--accent": g[800],
    "--accent-foreground": g[50],
    "--border": "oklch(1 0 0 / 10%)",
    "--input": "oklch(1 0 0 / 15%)",
    "--ring": ring,
    "--sidebar": g[900],
    "--sidebar-foreground": g[50],
    "--sidebar-primary": p?.dark ?? darkSidebarPrimary,
    "--sidebar-primary-foreground": p ? g[950] : g[50],
    "--sidebar-accent": g[800],
    "--sidebar-accent-foreground": g[50],
    "--sidebar-border": "oklch(1 0 0 / 10%)",
    "--sidebar-ring": ring,
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
  const g = baseColors[theme.baseColor];
  const p =
    theme.primary === "default" ? undefined : primaryColors[theme.primary];

  return [
    block("html:root", {
      ...lightVariables(g, p),
      "--radius": theme.radius,
      ...(theme.font ? { "--font-sans": theme.font } : {}),
    }),
    block("html.dark", darkVariables(g, p)),
  ].join("\n");
}
