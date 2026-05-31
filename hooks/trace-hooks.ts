import { test } from '@playwright/test';

/**
 * Global setup hook for tracing
 * Automatically adds test name to trace context
 */
test.beforeEach(async ({ page }, testInfo) => {
  // Add test name to trace
  await page.context().tracing.startChunk?.();
  console.log(`Starting test: ${testInfo.title}`);
});

test.afterEach(async ({ page }, testInfo) => {
  // Stop trace chunk after each test
  await page.context().tracing.stopChunk?.();
  
  if (testInfo.status === 'failed') {
    console.log(`Test failed: ${testInfo.title}`);
  }
});
