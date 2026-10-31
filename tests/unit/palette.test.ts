import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/** The 5 imposed colours + 4 derived ones (brief §4.1). */
const PALETTE = {
  "sand-100": "#dcded6",
  "mist-200": "#ced0c3",
  "sage-300": "#b4bab1",
  "slate-500": "#859393",
  "pine-600": "#5d726f",
  ink: "#1c2625",
  "pine-700": "#4a5c5a",
  deep: "#2a3634",
  paper: "#f2f3ef",
} as const;

const ALLOWED = new Set<string>(Object.values(PALETTE));
const SRC = join(__dirname, "..", "..", "src");
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".svg", ".json"]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : EXTENSIONS.has(extname(path)) ? [path] : [];
  });
}

function normalizeHex(hex: string) {
  const h = hex.toLowerCase();
  // #abc → #aabbcc ; #rrggbbaa keeps its alpha out of the comparison
  if (h.length === 4) return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  return h.slice(0, 7);
}

// A hex colour not followed by another word character (so "#faq" or "#main" anchors never match).
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
// Raw colour functions bypass the tokens: use color-mix() with a var() instead.
const RAW_FN = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(\s*\d/g;

describe("palette", () => {
  const files = walk(SRC);

  it("scans the source tree", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("uses no hex colour outside the 9 palette tokens", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(HEX)) {
        if (!ALLOWED.has(normalizeHex(match[0]))) offenders.push(`${relative(SRC, file)}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("uses no raw rgb()/hsl()/oklch() colour", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(RAW_FN)) offenders.push(`${relative(SRC, file)}: ${match[0]}`);
    }
    expect(offenders).toEqual([]);
  });
});

/* ---------- WCAG 2.2 contrast of the text pairings actually used ---------- */

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

type Token = keyof typeof PALETTE;
// [text, background, minimum ratio] — 4.5 for body text, 3 for text ≥ 24px.
const PAIRS: [Token, Token, number][] = [
  ["ink", "sand-100", 4.5],
  ["ink", "mist-200", 4.5],
  ["ink", "paper", 4.5],
  ["pine-700", "sand-100", 4.5],
  ["pine-700", "paper", 4.5],
  ["pine-700", "mist-200", 4.5],
  ["paper", "pine-600", 4.5],
  ["paper", "pine-700", 4.5],
  ["sand-100", "deep", 4.5],
  ["mist-200", "deep", 4.5],
  ["pine-600", "sand-100", 3], // large headings only
];

describe("contrast", () => {
  it.each(PAIRS)("%s on %s ≥ %d:1", (fg, bg, min) => {
    expect(contrast(PALETTE[fg], PALETTE[bg])).toBeGreaterThanOrEqual(min);
  });
});
