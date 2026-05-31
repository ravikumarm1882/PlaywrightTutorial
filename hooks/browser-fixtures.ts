import { test as base, Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { BROWSER_TYPE, HEADLESS, USER_AGENT, VIDEO_DIR, LAUNCH_ARGS } from './env';

/**
 * Extended test fixtures for Browser, BrowserContext, and Page lifecycle management
 * Provides automatic setup and teardown of browser resources
 */

type BrowserType = 'chromium' | 'firefox' | 'webkit';

export interface BrowserTestFixtures {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

const browserInstances = new Map<BrowserType, Browser>();

async function getBrowserInstance(): Promise<Browser> {
  const type: BrowserType = BROWSER_TYPE;

  if (browserInstances.has(type)) {
    return browserInstances.get(type)!;
  }

  const browserMap = {
    chromium,
    firefox,
    webkit,
  } as const;

  const browserType = browserMap[type] ?? chromium;
  const launchOptions = {
    headless: HEADLESS,
    args: LAUNCH_ARGS,
  };

  const browser = await browserType.launch(launchOptions);
  browserInstances.set(type, browser);
  return browser;
}

async function closeBrowserInstance(): Promise<void> {
  const type: BrowserType = BROWSER_TYPE;
  const browser = browserInstances.get(type);
  if (browser) {
    await browser.close();
    browserInstances.delete(type);
  }
}

export const browserTest = base.extend<BrowserTestFixtures>({
  browser: [async ({}, use) => {
    console.log(`\n[Browser] Launching ${BROWSER_TYPE} browser...`);
    const browser = await getBrowserInstance();

    await use(browser);

    console.log(`[Browser] Browser instance ready`);
  }, { scope: 'worker' }],

  context: async ({ browser }, use, testInfo) => {
    console.log(`[Context] Creating new browser context for test: ${testInfo.title}`);

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: testInfo.status === 'failed' ? { dir: VIDEO_DIR } : undefined,
      userAgent: USER_AGENT,
    });

    console.log(`[Context] Context created`);
    await use(context);

    console.log(`[Context] Closing context...`);
    await context.close();
    console.log(`[Context] Context closed`);
  },

  page: async ({ context }, use, testInfo) => {
    console.log(`[Page] Creating new page for test: ${testInfo.title}`);

    const page = await context.newPage();

    page.on('pageerror', (error) => {
      console.error(`[Page Error] ${error.message}`);
    });

    page.on('console', (msg) => {
      console.log(`[Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    page.on('request', (request) => {
      if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
        console.log(`[Network] Request: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', (response) => {
      if ((response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch') && !response.ok()) {
        console.log(`[Network] Response Error: ${response.status()} ${response.url()}`);
      }
    });

    console.log(`[Page] Page created successfully`);
    await use(page);

    console.log(`[Page] Closing page...`);
    await page.close();
    console.log(`[Page] Page closed`);
  },
});

browserTest.afterAll(async () => {
  console.log('\n[Cleanup] Closing all browser instances...');
  await closeBrowserInstance();
  console.log('[Cleanup] All browser instances closed');
});
