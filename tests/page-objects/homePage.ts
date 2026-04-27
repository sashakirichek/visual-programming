import { Page, expect } from "@playwright/test";

export class HomePage {
  private page: Page;
  private readonly baseURL = "https://visual-programming-4jx.pages.dev/";

  // Selectors
  private readonly shareButton = { title: "Copy shareable URL to clipboard" };
  private readonly jsonPaletteItem = { title: "JSON operations" };
  private readonly solutionsButton = { testId: "solutions-btn" };

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the home page
   */
  async navigateToHomePage(): Promise<void> {
    await this.page.goto(this.baseURL);
  }

  /**
   * Internal helper: Get the share button element
   */
  private async getShareButton() {
    return this.page.getByTitle(this.shareButton.title);
  }

  /**
   * Verify share button is visible
   */
  async verifyShareButtonIsVisible(): Promise<void> {
    const button = await this.getShareButton();
    await expect(button).toBeVisible();
  }

  /**
   * Wait for the page to load (wait for share button to be visible)
   */
  async waitForPageToLoad(): Promise<void> {
    const button = await this.getShareButton();
    await button.waitFor({ state: "visible" });
  }

  /**
   * Internal helper: Get the JSON palette item element
   */
  private async getJsonPaletteItem() {
    return this.page.getByTitle(this.jsonPaletteItem.title);
  }

  /**
   * Click the JSON palette item to add it to the canvas
   */
  async clickJsonPaletteItem(): Promise<void> {
    const jsonItem = await this.getJsonPaletteItem();
    await jsonItem.click();
  }

  /**
   * Verify a JSON node was created on the canvas (checks for element with "JSON" in text)
   */
  async verifyJsonNodeAppearedOnCanvas(): Promise<void> {
    const jsonNode = this.page.locator('[class*="react-node"]').filter({ hasText: /JSON/ });
    await expect(jsonNode).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get the Solutions button element
   */
  private async getSolutionsButton() {
    return this.page.getByRole("button", { name: /solutions/i });
  }

  /**
   * Verify Solutions button is visible
   */
  async verifySolutionsButtonIsVisible(): Promise<void> {
    const button = await this.getSolutionsButton();
    await expect(button).toBeVisible();
  }

  /**
   * Click the Solutions button to open the solutions panel
   */
  async clickSolutionsButton(): Promise<void> {
    const button = await this.getSolutionsButton();
    await button.click();
  }

  /**
   * Verify the Solutions panel is visible
   */
  async verifySolutionsPanelIsVisible(): Promise<void> {
    const panel = this.page.locator('[class*="solutions-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify the Solutions panel is not visible
   */
  async verifySolutionsPanelIsNotVisible(): Promise<void> {
    const panel = this.page.locator('[class*="solutions-panel"]');
    await expect(panel).not.toBeVisible();
  }

  /**
   * Get the "Save Solution" button from the Solutions panel
   */
  private async getSaveSolutionButton() {
    return this.page.getByRole("button", { name: /save\s*solution/i });
  }

  /**
   * Verify the "Save Solution" button is visible in the panel
   */
  async verifySaveSolutionButtonIsVisible(): Promise<void> {
    const button = await this.getSaveSolutionButton();
    await expect(button).toBeVisible();
  }

  /**
   * Click the "Save Solution" button
   */
  async clickSaveSolutionButton(): Promise<void> {
    const button = await this.getSaveSolutionButton();
    await button.click();
  }

  /**
   * Get the solutions list from the panel
   */
  async getSolutionsList() {
    return this.page.locator('[class*="solutions-list"]');
  }

  /**
   * Verify solutions list is visible
   */
  async verifySolutionsListIsVisible(): Promise<void> {
    const list = await this.getSolutionsList();
    await expect(list).toBeVisible();
  }

  /**
   * Close the Solutions panel by clicking the close button or clicking outside
   */
  async closeSolutionsPanel(): Promise<void> {
    const closeButton = this.page.locator('[class*="solutions-panel"]').locator('button[aria-label*="close" i]');
    const closeButtonExists = await closeButton.count().catch(() => 0);
    
    if (closeButtonExists > 0) {
      await closeButton.click();
    } else {
      // If no close button found, click outside the panel
      await this.page.click("body", { position: { x: 50, y: 50 } });
    }
  }

  /**
   * Toggle Solutions panel (open if closed, close if open)
   */
  async toggleSolutionsPanel(): Promise<void> {
    await this.clickSolutionsButton();
  }
}
