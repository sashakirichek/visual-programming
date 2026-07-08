import { Page, expect } from "@playwright/test";

export class ExamplesPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickExamplesButton(): Promise<void> {
    await this.page.getByRole("button", { name: /examples/i }).click();
  }

  async verifyExamplesPanelIsVisible(): Promise<void> {
    const panel = this.page.locator(".panel:has-text('EXAMPLES')");
    await expect(panel).toBeVisible({ timeout: 5000 });
  }

  async clickExampleLoadButton(title: string): Promise<void> {
    const exampleItem = this.page.locator(".example-item").filter({ hasText: title });
    await expect(exampleItem).toBeVisible({ timeout: 5000 });
    await exampleItem.getByRole("button", { name: /load/i }).click();
  }

  async verifyCanvasContainsNode(typeLabel: string): Promise<void> {
    const node = this.page.locator('[class*="react-node"]').filter({ hasText: typeLabel });
    await expect(node).toBeVisible({ timeout: 5000 });
  }
}
