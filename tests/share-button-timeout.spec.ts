import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects/homePage";

/**
 * Sunshine test: Share button shows "URL copied!" feedback and
 * then reverts to "Share" after the 5-second timeout introduced
 * in commit 1b6d839 (share-button-fix).
 */
test("shareButton_showsCopiedMessageThenReverts", async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  await homePage.navigateToHomePage();
  await homePage.waitForPageToLoad();

  const shareButton = page.getByTestId("shareUrl");
  await expect(shareButton).toBeVisible();
  await expect(shareButton).toContainText("Share");

  // Act
  await shareButton.click();

  // Assert — feedback message appears immediately after click
  await expect(shareButton).toContainText("URL copied!", { timeout: 3000 });

  // Assert — message reverts to "Share" after the 5-second timeout
  await expect(shareButton).toContainText("Share", { timeout: 7000 });
});
