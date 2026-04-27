import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects/homePage";

test("has title", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await expect(page).toHaveTitle(/visual-programming/);
});

test("get started link", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.verifyShareButtonIsVisible();

  // Grant clipboard permission so navigator.clipboard.writeText() succeeds in CI
  await page.context().grantPermissions(["clipboard-write"]);

  const shareButton = page.getByTitle("Copy shareable URL to clipboard");
  await expect(shareButton).toContainText("Share");
  await shareButton.click();
  await expect(shareButton).toContainText("URL copied!");
});

test("verify page loads successfully", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();
  const title = await page.title();
  expect(title).toContain("visual-programming");
});

test("share button functionality", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.verifyShareButtonIsVisible();

  // Grant clipboard permission so navigator.clipboard.writeText() succeeds in CI
  await page.context().grantPermissions(["clipboard-write"]);

  const shareButton = page.getByTitle("Copy shareable URL to clipboard");
  await shareButton.click();
  await expect(shareButton).toContainText("URL copied!");
});

test("addJsonElement_showsSuccessfully", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  // Verify JSON palette item is visible
  const jsonItem = page.getByTitle("JSON operations");
  await expect(jsonItem).toBeVisible();
  const labelElement = jsonItem.locator(".palette-label");
  await expect(labelElement).toContainText("JSON");
  const descElement = jsonItem.locator(".palette-desc");
  await expect(descElement).toContainText("JSON operations");

  // Click JSON palette item to add it to the canvas
  await homePage.clickJsonPaletteItem();

  // Verify a new JSON node appeared on the canvas
  await homePage.verifyJsonNodeAppearedOnCanvas();
});

test("json_palette_item_has_correct_styling", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  // Verify JSON palette item exists and has palette-item class
  const jsonItem = page.getByTitle("JSON operations");
  await expect(jsonItem).toHaveClass(/palette-item/);
});

test("json_node_persists_after_addition", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  // Add JSON element
  await homePage.clickJsonPaletteItem();
  await homePage.verifyJsonNodeAppearedOnCanvas();

  // Verify node still exists after a small delay
  await page.waitForTimeout(1000);
  await homePage.verifyJsonNodeAppearedOnCanvas();

  // Verify the node contains expected content
  const jsonNode = page.locator('[class*="react-node"]').filter({ hasText: /JSON/ });
  await expect(jsonNode).toBeVisible();
});

test("SolutionsPanel_isVisible", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  // Verify Solutions button is visible
  await homePage.verifySolutionsButtonIsVisible();

  // Click Solutions button to open the panel
  await homePage.clickSolutionsButton();

  // Verify Solutions panel appears
  await homePage.verifySolutionsPanelIsVisible();
});

test("SolutionsPanel_contains_save_button", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  // Open Solutions panel
  await homePage.clickSolutionsButton();
  await homePage.verifySolutionsPanelIsVisible();

  // Verify Save Solution button is available
  await homePage.verifySaveSolutionButtonIsVisible();
});

test("SolutionsPanel_displays_solutions_list", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  // Open Solutions panel
  await homePage.clickSolutionsButton();
  await homePage.verifySolutionsPanelIsVisible();

  // Verify solutions list is displayed
  await homePage.verifySolutionsListIsVisible();
});

test("SolutionsPanel_save_solution_functionality", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  // Open Solutions panel
  await homePage.clickSolutionsButton();
  await homePage.verifySolutionsPanelIsVisible();

  // Verify Save Solution button is available
  await homePage.verifySaveSolutionButtonIsVisible();

  // Click Save Solution button
  await homePage.clickSaveSolutionButton();

  // Verify success message or confirmation appears
  const successMessage = page.locator('[class*="success"], [role="alert"]');
  await expect(successMessage).toBeVisible({ timeout: 3000 });
});

test("SolutionsPanel_can_be_closed", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  // Open Solutions panel
  await homePage.clickSolutionsButton();
  await homePage.verifySolutionsPanelIsVisible();

  // Close the panel
  await homePage.closeSolutionsPanel();

  // Verify panel is no longer visible
  await homePage.verifySolutionsPanelIsNotVisible();
});

test("SolutionsPanel_toggle_functionality", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  // Initial state - panel should not be visible
  await homePage.verifySolutionsPanelIsNotVisible();

  // Toggle to open
  await homePage.toggleSolutionsPanel();
  await homePage.verifySolutionsPanelIsVisible();

  // Toggle to close
  await homePage.toggleSolutionsPanel();
  await homePage.verifySolutionsPanelIsNotVisible();

  // Toggle to open again
  await homePage.toggleSolutionsPanel();
  await homePage.verifySolutionsPanelIsVisible();
});
