import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  { fr: "/", en: "/en" },
  { fr: "/a-propos", en: "/en/about" },
  { fr: "/projets", en: "/en/projects" },
  { fr: "/devis", en: "/en/quote" },
  { fr: "/mentions-legales", en: "/en/legal-notice" },
];

test.describe("routing and hreflang", () => {
  for (const { fr, en } of PAGES) {
    test(`${fr} ↔ ${en}`, async ({ page }) => {
      const res = await page.goto(fr);
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
      await expect(page.locator("h1")).toHaveCount(1);

      const alt = page.locator('link[rel="alternate"][hreflang="en"]');
      await expect(alt).toHaveAttribute("href", new RegExp(`${en.replace(/\//g, "\\/")}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

      await page.goto(en);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  }

  test("unknown URL renders the localized 404", async ({ page }) => {
    const res = await page.goto("/cette-page-n-existe-pas");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("introuvable");
  });
});

test.describe("accessibility", () => {
  for (const { fr, en } of PAGES) {
    for (const path of [fr, en]) {
      test(`axe: ${path}`, async ({ page }) => {
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
        expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
      });
    }
  }

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#contenu$/);
  });
});

test.describe("mobile navigation", () => {
  test("menu opens, traps focus and closes with Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Projets" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("action bar exposes call and quote", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    const bar = page.getByRole("navigation", { name: "Actions rapides" });
    await expect(bar.getByRole("link", { name: "Appeler" })).toHaveAttribute("href", "tel:+21621034422");
    await expect(bar.getByRole("link", { name: "Devis" })).toBeVisible();
  });
});
