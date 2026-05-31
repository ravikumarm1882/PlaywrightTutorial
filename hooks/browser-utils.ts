import { type Locator, type Page } from '@playwright/test';
import { SCREENSHOT_DIR, VERBOSE_LOGS } from './env';

/**
 * Standalone browser utilities — page-agnostic helpers for tests that use the
 * raw `page` fixture. Locator-based and auto-waiting; logging is opt-in via
 * VERBOSE_LOGS. Page objects should prefer methods on BasePage instead.
 */

function log(message: string) {
  if (VERBOSE_LOGS) {
    console.log(message);
  }
}

function toLocator(page: Page, target: string | Locator): Locator {
  return typeof target === 'string' ? page.locator(target) : target;
}

/** Navigate to a URL with an optional wait condition. */
export async function navigateTo(
  page: Page,
  url: string,
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
) {
  log(`[Navigation] Going to ${url}`);
  await page.goto(url, { waitUntil });
}

/** Wait for an element to be visible and return its Locator. */
export async function waitForElement(
  page: Page,
  target: string | Locator,
  timeout?: number,
): Promise<Locator> {
  const locator = toLocator(page, target);
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

/** Click an element (auto-waits for actionability). */
export async function clickElement(page: Page, target: string | Locator) {
  await toLocator(page, target).click();
}

/** Fill a form input, replacing any existing value. */
export async function fillInput(page: Page, target: string | Locator, text: string) {
  await toLocator(page, target).fill(text);
}

/** Get an element's visible text. */
export async function getElementText(page: Page, target: string | Locator): Promise<string> {
  return toLocator(page, target).innerText();
}

/** Check whether an element is currently visible. */
export async function isElementVisible(page: Page, target: string | Locator): Promise<boolean> {
  return toLocator(page, target).isVisible();
}

/** Take a screenshot into SCREENSHOT_DIR. */
export async function takeScreenshot(page: Page, name: string) {
  const safeName = name.replace(/[^a-z0-9-_]+/gi, '-');
  const filename = `${SCREENSHOT_DIR}/${safeName}.png`;
  await page.screenshot({ path: filename });
  log(`[Screenshot] Saved: ${filename}`);
}

/** Set the viewport size. */
export async function setViewport(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
}

/** Execute a function in the page context. */
export async function executeScript<T>(page: Page, fn: () => T | Promise<T>): Promise<T> {
  return page.evaluate(fn);
}

/** Wait for the URL to match a string or pattern. */
export async function waitForUrl(page: Page, urlPattern: string | RegExp, timeout?: number) {
  await page.waitForURL(urlPattern, { timeout });
}

/** Retry an async operation with exponential backoff. */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  let delay = delayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(`[Retry] Attempt ${attempt} of ${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      log(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Retry failed: ${String(lastError)}`);
}

/** Clear cookies, localStorage, and sessionStorage. */
export async function clearStorage(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/** Set a bearer auth header for subsequent requests. */
export async function setAuthHeader(page: Page, token: string, headerName = 'Authorization') {
  await page.setExtraHTTPHeaders({
    [headerName]: `Bearer ${token}`,
  });
}

/** Capture console messages emitted during an action. */
export async function captureConsoleLogs(
  page: Page,
  action: () => Promise<void>,
): Promise<string[]> {
  const logs: string[] = [];
  const handler = (msg: { type(): string; text(): string }) =>
    logs.push(`${msg.type()}: ${msg.text()}`);

  page.on('console', handler);
  try {
    await action();
  } finally {
    page.off('console', handler);
  }
  return logs;
}

/** Assert multiple boolean conditions, collecting all failures. */
export function assertMultiple(assertions: Array<{ condition: boolean; message: string }>) {
  const failures = assertions.filter((a) => !a.condition).map((a) => a.message);
  if (failures.length > 0) {
    throw new Error(`${failures.length} assertion(s) failed:\n${failures.join('\n')}`);
  }
}
