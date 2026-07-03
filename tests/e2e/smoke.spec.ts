import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("nav[data-stavnet-animate='footer']")).toBeVisible();
});

test("menu page loads", async ({ page }) => {
  await page.goto("/fr/menu");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("[data-stavnet-animate='menu-content']")).toBeVisible();
});
