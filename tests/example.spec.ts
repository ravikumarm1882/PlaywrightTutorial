import { test, expect } from '../hooks/fixtures';

test.describe('Playwright Website Tests', () => {
  test('has title', async ({ homePage }) => {
    console.log(`\n[Test] Running: has title`);

    await homePage.open();
    await homePage.expectTitle(/Playwright/);
    console.log(`[Assert] Page title contains "Playwright"`);
  });

  test('get started link', async ({ homePage }) => {
    console.log(`\n[Test] Running: get started link`);

    await homePage.open();
    const installationPage = await homePage.clickGetStarted();

    const headingVisible = await installationPage.isInstallationHeadingVisible().catch(() => false);
    await expect(headingVisible).toBeTruthy();
    console.log(`[Assert] Installation heading is visible`);

    await installationPage.takeScreenshot('installation-page');
  });
});
