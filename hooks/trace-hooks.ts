import type { Page, TestType } from '@playwright/test';
import { VERBOSE_LOGS } from './env';

/**
 * Registers diagnostic before/after hooks on the GIVEN test object.
 *
 * Tracing, video, and screenshot capture are configured in
 * `playwright.config.ts`; these hooks only add a per-test log line and attach a
 * screenshot to the report on failure. Call this once with the project `test`
 * (see hooks/fixtures.ts) so the hooks actually run for real tests.
 */
// The test object carries many fixtures; we only need `page`, so accept a loose type.
export function registerDiagnosticsHooks(test: TestType<{ page: Page }, object>): void {
  test.beforeEach(async ({}, testInfo) => {
    if (VERBOSE_LOGS) {
      console.log(`[Test] Starting: ${testInfo.title}`);
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot().catch(() => undefined);
      if (screenshot) {
        await testInfo.attach('failure-screenshot', { body: screenshot, contentType: 'image/png' });
      }
      if (VERBOSE_LOGS) {
        console.log(`[Test] Failed: ${testInfo.title}`);
      }
    }
  });
}
