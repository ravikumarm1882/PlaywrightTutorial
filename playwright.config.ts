import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';
import { BASE_URL, HEADLESS, USER_AGENT, LAUNCH_ARGS } from './hooks/env';

const isCI = !!process.env.CI;

/**
 * Multi-browser project matrix. Set BROWSER_TYPE (chromium|firefox|webkit) to
 * run a single browser; leave it unset to run all three.
 * See https://playwright.dev/docs/test-configuration.
 */
const allProjects: NonNullable<PlaywrightTestConfig['projects']> = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
];

const selected = process.env.BROWSER_TYPE;
const projects = selected
  ? allProjects.filter((project) => project.name === selected)
  : allProjects;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',

  /* Run tests in files in parallel. */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only. */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,

  /* Per-test and assertion timeouts. */
  timeout: 60_000,
  expect: { timeout: 10_000 },

  /* Reporters: concise console output plus the rich HTML report. */
  reporter: [['list'], ['html', { open: 'never' }]],

  /* Shared settings for all projects. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: BASE_URL,
    headless: HEADLESS,
    viewport: { width: 1280, height: 720 },
    userAgent: USER_AGENT,
    launchOptions: { args: LAUNCH_ARGS },

    /* Locator resolution for getByTestId(). */
    testIdAttribute: 'data-testid',

    /* Auto-waiting timeouts for actions/navigations. */
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    /* Diagnostics — captured only when useful. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects,

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !isCI,
  // },
});
