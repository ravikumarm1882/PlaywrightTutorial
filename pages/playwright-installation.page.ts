import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base-page';

export class PlaywrightInstallationPage extends BasePage {
  readonly installationHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.installationHeading = this.page.getByRole('heading', { name: /Installation/i });
  }

  async isInstallationHeadingVisible(): Promise<boolean> {
    return this.installationHeading.isVisible();
  }

  async expectInstallationHeadingVisible() {
    await expect(this.installationHeading).toBeVisible();
  }
}
