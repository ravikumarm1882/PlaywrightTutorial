import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { BASE_URL } from '../hooks/env';
import { PlaywrightInstallationPage } from './playwright-installation.page';

export class PlaywrightHomePage extends BasePage {
  readonly getStartedLink: Locator;

  constructor(page: Page) {
    super(page);
    this.getStartedLink = this.page.getByRole('link', { name: /Get started/i });
  }

  async open() {
    await this.goto(BASE_URL, 'load');
  }

  async clickGetStarted(): Promise<PlaywrightInstallationPage> {
    await Promise.all([
      this.page.waitForLoadState('networkidle'),
      this.getStartedLink.click(),
    ]);
    return new PlaywrightInstallationPage(this.page);
  }
}
