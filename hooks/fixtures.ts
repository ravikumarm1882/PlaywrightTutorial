import { PlaywrightHomePage } from '../pages/playwright-home.page';
import { browserTest, BrowserTestFixtures } from './browser-fixtures';

export interface TestFixtures extends BrowserTestFixtures {
  homePage: PlaywrightHomePage;
}

export const test = browserTest.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new PlaywrightHomePage(page);
    await use(homePage);
  },
});

export { expect } from '@playwright/test';
