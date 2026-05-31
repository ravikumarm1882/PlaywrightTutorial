import { expect, type Locator, type Page } from '@playwright/test';
import { SCREENSHOT_DIR } from '../hooks/env';

/**
 * Base class for all page objects.
 *
 * Methods accept either a CSS/text selector string or a Locator and normalize to
 * a Locator internally, so callers get Playwright's auto-waiting and web-first
 * assertions. Prefer the `expect*` helpers over the boolean getters in test code.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Resolve a string selector or pass through an existing Locator. */
  protected locator(target: string | Locator): Locator {
    return typeof target === 'string' ? this.page.locator(target) : target;
  }

  async goto(url: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'load') {
    await this.page.goto(url, { waitUntil });
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  /** Wait for an element to be attached/visible and return its Locator. */
  async waitForElement(target: string | Locator, timeout?: number): Promise<Locator> {
    const locator = this.locator(target);
    await locator.waitFor({ state: 'visible', timeout });
    return locator;
  }

  async click(target: string | Locator) {
    await this.locator(target).click();
  }

  async fillInput(target: string | Locator, text: string) {
    await this.locator(target).fill(text);
  }

  async getText(target: string | Locator): Promise<string> {
    return this.locator(target).innerText();
  }

  async isVisible(target: string | Locator): Promise<boolean> {
    return this.locator(target).isVisible();
  }

  async waitForUrl(urlOrMatcher: string | RegExp, timeout?: number) {
    await this.page.waitForURL(urlOrMatcher, { timeout });
  }

  // --- Web-first assertions (preferred in tests) ---

  async expectVisible(target: string | Locator) {
    await expect(this.locator(target)).toBeVisible();
  }

  async expectText(target: string | Locator, expected: string | RegExp) {
    await expect(this.locator(target)).toHaveText(expected);
  }

  async expectTitle(expected: string | RegExp) {
    await expect(this.page).toHaveTitle(expected);
  }

  async expectUrl(urlOrMatcher: string | RegExp) {
    await expect(this.page).toHaveURL(urlOrMatcher);
  }

  // --- Utilities ---

  async takeScreenshot(name: string) {
    const safeName = name.replace(/[^a-z0-9-_]+/gi, '-');
    const filename = `${SCREENSHOT_DIR}/${safeName}.png`;
    await this.page.screenshot({ path: filename });
  }

  async setViewport(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
  }

  async executeScript<T>(fn: () => T | Promise<T>): Promise<T> {
    return this.page.evaluate(fn);
  }

  async captureConsoleLogs(action: () => Promise<void>): Promise<string[]> {
    const logs: string[] = [];
    const handler = (msg: { type(): string; text(): string }) =>
      logs.push(`${msg.type()}: ${msg.text()}`);

    this.page.on('console', handler);
    try {
      await action();
    } finally {
      this.page.off('console', handler);
    }
    return logs;
  }

  async clearStorage() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async setAuthHeader(token: string, headerName = 'Authorization') {
    await this.page.setExtraHTTPHeaders({
      [headerName]: `Bearer ${token}`,
    });
  }

  async assertMultiple(assertions: Array<{ condition: boolean; message: string }>) {
    const failures = assertions.filter((a) => !a.condition).map((a) => a.message);
    if (failures.length > 0) {
      throw new Error(`${failures.length} assertion(s) failed:\n${failures.join('\n')}`);
    }
  }
}
