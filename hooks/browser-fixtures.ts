import { test as base, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { VERBOSE_LOGS } from './env';

/**
 * Base test layer.
 *
 * Browser / context / page lifecycle, headless mode, viewport, user agent,
 * launch args, tracing, screenshots, and video are all driven by
 * `playwright.config.ts` (the single source of truth) and Playwright's native
 * fixtures. This layer adds nothing to that lifecycle except optional, opt-in
 * diagnostic logging on the page — enabled with VERBOSE_LOGS=true.
 */

export interface BrowserTestFixtures {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export const browserTest = base.extend<BrowserTestFixtures>({
  page: async ({ page }, use) => {
    if (VERBOSE_LOGS) {
      page.on('pageerror', (error) => {
        console.error(`[Page Error] ${error.message}`);
      });

      page.on('console', (msg) => {
        console.log(`[Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
      });

      page.on('requestfinished', async (request) => {
        const type = request.resourceType();
        if (type === 'xhr' || type === 'fetch') {
          const response = await request.response();
          const status = response ? response.status() : '—';
          console.log(`[Network] ${request.method()} ${status} ${request.url()}`);
        }
      });
    }

    await use(page);
  },
});
