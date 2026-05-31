import { test } from '../hooks/fixtures';

test.describe('Playwright Website Tests', () => {
  test('has title', async ({ homePage }) => {
    await homePage.open();
    await homePage.expectTitle(/Playwright/);
  });

  test('get started link', async ({ homePage }) => {
    await homePage.open();
    const installationPage = await homePage.clickGetStarted();

    await installationPage.expectInstallationHeadingVisible();
    await installationPage.takeScreenshot('installation-page');
  });
});
