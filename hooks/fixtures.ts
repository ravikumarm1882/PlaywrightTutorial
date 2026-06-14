import { PlaywrightHomePage } from '../pages/playwright-home.page';
import { PlaywrightInstallationPage } from '../pages/playwright-installation.page';
import { browserTest, type BrowserTestFixtures } from './browser-fixtures';
import { registerDiagnosticsHooks } from './trace-hooks';

export interface TestFixtures extends BrowserTestFixtures {
  homePage: PlaywrightHomePage;
  installationPage: PlaywrightInstallationPage;
}

export const test = browserTest.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new PlaywrightHomePage(page);
    await use(homePage);
  },
  installationPage: async ({ page }, use) => {
    const installationPage = new PlaywrightInstallationPage(page);
    await use(installationPage);
  },
});

// Attach diagnostic hooks to the project `test` so they actually run.
registerDiagnosticsHooks(test);

export { expect } from '@playwright/test';
