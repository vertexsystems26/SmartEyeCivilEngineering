import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";

/*
 * Three self-hosted variable families (one file per family for Latin text;
 * the latin-ext file is only fetched by browsers when a glyph needs it).
 * Only the display and body fonts are preloaded; mono is used for small
 * labels and can swap in.
 */
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-bricolage",
});

export const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-manrope",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains",
});

export const fontVariables = [bricolage.variable, manrope.variable, jetbrainsMono.variable].join(" ");
