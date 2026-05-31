import { Page, expect } from '@playwright/test';

/**
 * Browser utilities - Common browser operations
 */

/**
 * Navigate to a URL with optional wait condition
 */
export async function navigateTo(page: Page, url: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'load') {
  console.log(`[Navigation] Going to ${url}`);
  await page.goto(url, { waitUntil });
  console.log(`[Navigation] Loaded ${url}`);
}

/**
 * Wait for element and return it
 */
export async function waitForElement(page: Page, selector: string, timeout = 30000) {
  console.log(`[Wait] Waiting for element: ${selector}`);
  const element = await page.waitForSelector(selector, { timeout });
  console.log(`[Wait] Element found: ${selector}`);
  return element;
}

/**
 * Click element and optionally wait for navigation
 */
export async function clickElement(page: Page, selector: string, waitForNavigation = false) {
  console.log(`[Click] Clicking element: ${selector}`);
  if (waitForNavigation) {
    await Promise.all([
      page.waitForNavigation(),
      page.click(selector),
    ]);
  } else {
    await page.click(selector);
  }
  console.log(`[Click] Element clicked: ${selector}`);
}

/**
 * Fill form input
 */
export async function fillInput(page: Page, selector: string, text: string, delay = 100) {
  console.log(`[Input] Filling ${selector} with text: ${text}`);
  await page.fill(selector, '');
  await page.type(selector, text, { delay });
  console.log(`[Input] Text entered: ${selector}`);
}

/**
 * Get element text
 */
export async function getElementText(page: Page, selector: string): Promise<string> {
  const text = await page.textContent(selector);
  console.log(`[Text] Retrieved text from ${selector}: ${text}`);
  return text || '';
}

/**
 * Check if element is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  const visible = await page.isVisible(selector);
  console.log(`[Visibility] Element ${selector} visible: ${visible}`);
  return visible;
}

/**
 * Take screenshot
 */
export async function takeScreenshot(page: Page, name: string) {
  const filename = `test-results/screenshots/${name}-${Date.now()}.png`;
  await page.screenshot({ path: filename });
  console.log(`[Screenshot] Saved: ${filename}`);
}

/**
 * Set viewport size
 */
export async function setViewport(page: Page, width: number, height: number) {
  console.log(`[Viewport] Setting viewport to ${width}x${height}`);
  await page.setViewportSize({ width, height });
  console.log(`[Viewport] Viewport set`);
}

/**
 * Execute JavaScript in page context
 */
export async function executeScript<T>(page: Page, script: string | (() => T), arg?: unknown): Promise<T> {
  console.log(`[Script] Executing script in page context`);
  const result = await page.evaluate(script, arg);
  console.log(`[Script] Script executed successfully`);
  return result;
}

/**
 * Wait for URL to match pattern
 */
export async function waitForUrl(page: Page, urlPattern: string | RegExp, timeout = 30000) {
  console.log(`[URL] Waiting for URL: ${urlPattern}`);
  await page.waitForURL(urlPattern, { timeout });
  console.log(`[URL] URL matched: ${page.url()}`);
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Retry] Attempt ${i + 1} of ${maxRetries}`);
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error(`[Retry] All ${maxRetries} attempts failed`);
        throw error;
      }
      console.log(`[Retry] Attempt ${i + 1} failed, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 2; // Exponential backoff
    }
  }
  // This should never be reached, but satisfies TypeScript
  throw new Error('Retry operation failed');
}

/**
 * Clear storage (cookies, local storage, session storage)
 */
export async function clearStorage(page: Page) {
  console.log(`[Storage] Clearing all storage`);
  await page.context()?.clearCookies();
  await executeScript(page, () => {
    localStorage.clear();
    sessionStorage.clear();
  });
  console.log(`[Storage] Storage cleared`);
}

/**
 * Set authentication cookie/header
 */
export async function setAuthHeader(page: Page, token: string, headerName = 'Authorization') {
  console.log(`[Auth] Setting authentication header`);
  await page.setExtraHTTPHeaders({
    [headerName]: `Bearer ${token}`,
  });
  console.log(`[Auth] Authentication header set`);
}

/**
 * Get all console messages during an action
 */
export async function captureConsoleLogs(page: Page, action: () => Promise<void>): Promise<string[]> {
  const logs: string[] = [];
  const handler = (msg: any) => logs.push(`${msg.type()}: ${msg.text()}`);
  
  page.on('console', handler);
  await action();
  page.removeListener('console', handler);
  
  console.log(`[Console] Captured ${logs.length} console messages`);
  return logs;
}

/**
 * Assert multiple conditions
 */
export async function assertMultiple(assertions: Array<{ condition: boolean; message: string }>) {
  const failures: string[] = [];
  
  for (const assertion of assertions) {
    if (!assertion.condition) {
      failures.push(assertion.message);
      console.error(`[Assert] Failed: ${assertion.message}`);
    }
  }
  
  if (failures.length > 0) {
    throw new Error(`${failures.length} assertion(s) failed:\n${failures.join('\n')}`);
  }
  
  console.log(`[Assert] All ${assertions.length} assertions passed`);
}
