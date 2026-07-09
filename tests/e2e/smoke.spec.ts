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

test("person and organization interlinks work on key detail flows", async ({ page }) => {
  await page.goto("/fr/persons/details?name=Ada%20Aharoni");
  await expect(page.getByRole("link", { name: "Hébreu" })).toBeVisible();
  await page.getByRole("link", { name: "Hébreu" }).click();
  await expect(page).toHaveURL(/\/fr\/books\/related\?facet=authorWritingLanguage&value=/);

  await page.goBack();
  await page.getByRole("button", { name: "Titres traduits" }).click();
  await page.getByRole("link", { name: "Métal et Violettes" }).first().click();
  await expect(page).toHaveURL(/\/fr\/books(\/details\?id=|\?page=1&q=)/);

  await page.goto("/fr/orgs/details?name=Fayard");
  await expect(page.getByRole("link", { name: "France" })).toBeVisible();
  await page.getByRole("link", { name: "France" }).click();
  await expect(page).toHaveURL(/\/fr\/books\/related\?facet=publisherCountry&value=France/);

  await page.goto("/fr/orgs");
  await page.getByRole("link", { name: "Editeurs" }).click();
  await expect(page).toHaveURL(/\/fr\/orgs\?page=1&type=Editeur/);
  await expect(page.locator("table")).toBeVisible();
});
