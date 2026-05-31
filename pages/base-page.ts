import { expect, Locator, Page } from '@playwright/test';
import { SCREENSHOT_DIR } from '../hooks/env';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'load') {
    await this.page.goto(url, { waitUntil });
  }

  async title(): Promise<string> {
    return this.page.title();
  }
  
  async waitForElement(selector: string, timeout = 30000): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ timeout });
    return locator;
}

  async click(selector: string, waitForNavigation = false) {
    if (waitForNavigation) {
      await Promise.all([
        this.page.waitForNavigation(),
        this.page.click(selector),
      ]);
    } else {
      await this.page.click(selector);
    }
  }

  async fillInput(selector: string, text: string, delay = 100) {
    await this.page.fill(selector, '');
    await this.page.type(selector, text, { delay });
  }

  async getText(selector: string): Promise<string> {
    return (await this.page.textContent(selector)) ?? '';
  }

  async isVisible(selector: string): Promise<boolean> {
    return this.page.isVisible(selector);
  }

  async waitForUrl(urlOrMatcher: string | RegExp, timeout = 30000) {
    await this.page.waitForURL(urlOrMatcher, { timeout });
  }

  async expectTitle(expected: string | RegExp) {
    await expect(this.page).toHaveTitle(expected);
  }

  async expectUrl(urlOrMatcher: string | RegExp) {
    await expect(this.page).toHaveURL(urlOrMatcher);
  }

  async takeScreenshot(name: string) {
    const filename = `${SCREENSHOT_DIR}/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: filename });
  }

  async setViewport(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
  }

  async executeScript<T>(script: string | (() => T), arg?: unknown): Promise<T> {
    return this.page.evaluate(script, arg);
  }

  async captureConsoleLogs(action: () => Promise<void>): Promise<string[]> {
    const logs: string[] = [];
    const handler = (msg: any) => logs.push(`${msg.type()}: ${msg.text()}`);

    this.page.on('console', handler);
    await action();
    this.page.off('console', handler);

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
    const failures = assertions.filter((assertion) => !assertion.condition).map((assertion) => assertion.message);
    if (failures.length > 0) {
      throw new Error(`${failures.length} assertion(s) failed:\n${failures.join('\n')}`);
    }
  }
}
