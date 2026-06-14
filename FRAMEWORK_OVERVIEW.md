# PlaywrightTutorial Framework - Complete Guide

**Last Updated:** June 2026  
**Version:** 1.0  
**Purpose:** Comprehensive guide for all stakeholders to understand, use, and extend the PlaywrightTutorial UI automation framework.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [What is This Framework?](#what-is-this-framework)
3. [Core Principles](#core-principles)
4. [Architecture Overview](#architecture-overview)
5. [Project Structure](#project-structure)
6. [Tech Stack](#tech-stack)
7. [Setup & Installation](#setup--installation)
8. [Key Concepts](#key-concepts)
9. [Writing Your First Test](#writing-your-first-test)
10. [Page Object Model (POM) Pattern](#page-object-model-pom-pattern)
11. [Running Tests](#running-tests)
12. [Configuration Management](#configuration-management)
13. [Test Data Management (Excel)](#test-data-management-excel)
14. [Quality Gates](#quality-gates)
15. [Diagnostics & Debugging](#diagnostics--debugging)
16. [Extending the Framework](#extending-the-framework)
17. [Best Practices](#best-practices)
18. [Troubleshooting](#troubleshooting)
19. [Common Workflows](#common-workflows)

---

## Quick Start

For experienced Playwright users, here's the 60-second setup:

```bash
# 1. Install dependencies and browsers
npm install
npx playwright install

# 2. Set up environment
copy .env.example .env   # Windows
# cp .env.example .env  # macOS/Linux

# 3. Run tests
npm test                  # All browsers, all tests
npm run test:headed       # With visible browser
npm run test:ui           # Interactive UI mode

# 4. View reports
npm run report            # HTML test report
npm run trace             # Playwright trace viewer
```

---

## What is This Framework?

The **PlaywrightTutorial Framework** is a production-ready TypeScript-based UI automation framework built on [Playwright Test](https://playwright.dev). It combines:

- ✅ **Page Object Model (POM)** — Reusable page classes that encapsulate selectors and interactions
- ✅ **Configuration-Driven Behavior** — All browser settings in `playwright.config.ts`
- ✅ **Environment-Based Customization** — `.env` file controls BASE_URL, browsers, headless mode, user agent, etc.
- ✅ **Multi-Browser Support** — Runs tests against Chromium, Firefox, and WebKit simultaneously
- ✅ **Excel-Based Test Data** — Load test scenarios from `.xlsx` files for data-driven testing
- ✅ **Automatic Diagnostics** — Screenshots, videos, and traces on failure
- ✅ **Type Safety** — Full TypeScript type checking and IntelliSense support
- ✅ **Quality Gates** — Linting (ESLint) and formatting (Prettier) enforcement

### Who Should Use This?

- **QA Engineers** — Write and maintain automated tests without deep framework knowledge
- **Test Architects** — Extend and customize for domain-specific requirements
- **CI/CD Engineers** — Deploy and monitor tests in pipelines
- **Developers** — Debug UI issues with comprehensive failure diagnostics

---

## Core Principles

### 1. **Config-First Design**
All browser behavior lives in **one place**: `playwright.config.ts`. No magic in fixtures—only genuine value-adds (page objects, Excel reading, optional diagnostics).

### 2. **Type Safety**
Full TypeScript support with `@types/node` and strict type checking ensures errors are caught at development time, not runtime.

### 3. **Web-First Assertions**
Tests use `expect()` assertions with auto-waiting. No sleeps, no brittle waits—Playwright handles it.

### 4. **Readable Test Code**
Page objects and descriptive helpers make tests read like business scenarios, not low-level browser commands.

### 5. **Single Responsibility**
- **Config** → Browser behavior
- **Fixtures** → Test setup/teardown
- **Page Objects** → UI interaction
- **Tests** → Business logic

---

## Architecture Overview

```
┌─────────────────────────────────┐
│     tests/*.spec.ts             │  ← Test specs (business logic)
│  (import { test, expect })      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   hooks/fixtures.ts             │  ← Composed test fixture
│  (adds page objects + hooks)    │
└────────────┬────────────────────┘
             │ extends
             ▼
┌─────────────────────────────────┐
│ hooks/browser-fixtures.ts       │  ← Base test (opt-in diagnostics)
│  (thin wrapper around @playwright)
└────────────┬────────────────────┘
             │ uses
             ▼
┌─────────────────────────────────┐
│  @playwright/test               │  ← Native Playwright Test runner
│ (browser/context/page lifecycle)│
└────────────┬────────────────────┘
             │ configured by
             ▼
┌─────────────────────────────────┐
│  playwright.config.ts           │  ← SINGLE SOURCE OF TRUTH
│ (projects, timeouts, reporters) │
│         + env.ts                │
└─────────────────────────────────┘

Supporting Modules:
├── pages/base-page.ts         ← Locator-based POM base class
├── pages/*.page.ts            ← Domain-specific page objects
├── hooks/excel-utils.ts       ← Excel data reader
├── hooks/browser-utils.ts     ← Standalone helpers
└── hooks/trace-hooks.ts       ← Diagnostic hooks
```

---

## Project Structure

```
PlaywrightTutorial/
│
├── .github/workflows/
│   └── playwright.yml          ← CI/CD pipeline (GitHub Actions)
│
├── hooks/                      ← Framework core
│   ├── env.ts                  ← Load & type .env variables
│   ├── fixtures.ts             ← Main test fixture (what tests import)
│   ├── browser-fixtures.ts     ← Base test with diagnostics
│   ├── trace-hooks.ts          ← Attach diagnostic hooks
│   ├── browser-utils.ts        ← Standalone utilities (screenshots, video)
│   ├── extended-fixtures.ts    ← Opt-in API/Auth fixtures (optional)
│   └── excel-utils.ts          ← Read .xlsx test data
│
├── pages/                      ← Page Object Model
│   ├── base-page.ts            ← Base class with common helpers
│   ├── playwright-home.page.ts ← Example: Playwright homepage
│   └── playwright-installation.page.ts ← Example: Installation page
│
├── tests/                      ← Test specifications
│   ├── example.spec.ts         ← Simple test example
│   ├── data-driven.spec.ts     ← Excel data-driven example
│   └── *.spec.ts               ← Add your tests here
│
├── test_data/                  ← Test data files
│   └── test-data.xlsx          ← Excel with test scenarios
│
├── test-results/               ← Test output (generated)
│   ├── videos/                 ← Video recordings
│   ├── screenshots/            ← Screenshots
│   └── traces/                 ← Playwright traces
│
├── playwright-report/          ← HTML test report (generated)
│
├── .env.example                ← Environment template (copy to .env)
├── .env                        ← Local environment config (not committed)
├── playwright.config.ts        ← Playwright configuration
├── tsconfig.json               ← TypeScript configuration
├── eslint.config.mjs           ← Linting rules
├── .prettierrc.json            ← Code formatting config
├── package.json                ← Dependencies & scripts
└── README.md                   ← Quick reference
```

---

## Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **@playwright/test** | ^1.60.0 | Test runner & browser automation |
| **TypeScript** | ^5.7 | Language & type safety |
| **exceljs** | ^4.4.0 | Read/write Excel test data |
| **dotenv** | ^16.3.1 | Environment variable management |
| **ESLint** | ^9 | Code linting |
| **Prettier** | ^3 | Code formatting |
| **@types/node** | ^25.9.1 | Node.js type definitions |

---

## Setup & Installation

### Prerequisites

- **Node.js** LTS (v18+) [Download](https://nodejs.org/)
- **npm** (bundled with Node.js)
- **Git** (for version control)
- A supported OS: Windows, macOS, or Linux

### Step 1: Clone or Access the Repository

```bash
cd f:\Automation\PlaywrightTutorial
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json` into the `node_modules` directory.

### Step 3: Install Playwright Browsers

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit binaries (~500 MB total). Required only once.

### Step 4: Create Your Local `.env` File

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Edit `.env` to match your test environment (base URL, browser choice, etc.).

### Step 5: Verify Installation

```bash
npm run typecheck   # Should pass with no errors
npm run lint        # Should pass with no linting errors
npm test            # Should run tests successfully
```

If any command fails, see [Troubleshooting](#troubleshooting).

---

## Key Concepts

### Fixture

A **fixture** is Playwright's reusable test setup/teardown mechanism. The framework provides:

- **`page`** — Standard Playwright context (from `@playwright/test`)
- **`homePage`** — Page object for the home page (example)
- **`expect`** — Web-first assertions library

```typescript
import { test, expect } from '../hooks/fixtures';

test('example', async ({ homePage }) => {
  // 'homePage' is injected; automatically destroyed after test
  await homePage.open();
  await homePage.expectVisible('button');
});
```

### Locator

A **Locator** is Playwright's safe, auto-waiting selector. It doesn't access the DOM immediately—it waits for conditions to be met:

```typescript
const button = page.locator('button:has-text("Click me")');
await button.click();  // Auto-waits for visibility + clickability
```

### Page Object

A **Page Object** is a class that models a UI page/component. It encapsulates:
- Selectors (Locators)
- Navigation
- User interactions
- Assertions

```typescript
export class LoginPage extends BasePage {
  async login(username: string, password: string) {
    await this.fillInput('#username', username);
    await this.fillInput('#password', password);
    await this.click('button:has-text("Sign In")');
  }
}
```

### Spec (Test File)

A **spec** is a file containing test cases. Tests import fixtures and use them:

```typescript
import { test, expect } from '../hooks/fixtures';

test('user can log in', async ({ page }) => {
  // Test logic here
});
```

---

## Writing Your First Test

### Step 1: Create a New Page Object

Create a new file `pages/my-app.page.ts`:

```typescript
import { BasePage } from './base-page';

export class MyAppPage extends BasePage {
  async open() {
    await this.goto('');  // Uses BASE_URL from .env
  }

  async clickLoginButton() {
    await this.click('[data-testid="login-btn"]');
  }

  async expectLoggedIn() {
    await this.expectVisible('[data-testid="dashboard"]');
  }
}
```

### Step 2: Add Fixture

Update `hooks/fixtures.ts` to inject your page:

```typescript
import { MyAppPage } from '../pages/my-app.page';

export interface TestFixtures extends BrowserTestFixtures {
  homePage: PlaywrightHomePage;
  myApp: MyAppPage;  // ← Add this
}

export const test = browserTest.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new PlaywrightHomePage(page);
    await use(homePage);
  },
  myApp: async ({ page }, use) => {
    const myApp = new MyAppPage(page);
    await use(myApp);
  },
});
```

### Step 3: Write a Test

Create `tests/my-app.spec.ts`:

```typescript
import { test, expect } from '../hooks/fixtures';

test.describe('My App', () => {
  test('user can click login button', async ({ myApp }) => {
    await myApp.open();
    await myApp.clickLoginButton();
    await myApp.expectLoggedIn();
  });

  test('page has correct title', async ({ myApp }) => {
    await myApp.open();
    await myApp.expectTitle(/My App/);
  });
});
```

### Step 4: Run Your Tests

```bash
npm test                           # All browsers
npm run test:headed                # See the browser
npm run test:ui                    # Interactive mode
npx playwright test tests/my-app   # Just your new tests
```

---

## Page Object Model (POM) Pattern

The **Page Object Model** is a design pattern that improves test maintainability.

### Why Use POM?

| Without POM | With POM |
|------------|----------|
| Selectors scattered in tests | Selectors in one place (page class) |
| Hard to update when UI changes | Update selector in one location |
| Tests are hard to read | Tests read like user actions |
| High maintenance burden | Low maintenance |

### BasePage Methods

All page objects inherit from `BasePage`, which provides common utilities:

```typescript
// Navigation
await this.goto(url, waitUntil?: 'load' | 'domcontentloaded' | 'networkidle');
await this.waitForUrl(urlOrMatcher, timeout?);

// Interaction
await this.click(target);
await this.fillInput(target, text);
await this.waitForElement(target, timeout?);

// Queries
const text = await this.getText(target);
const isVisible = await this.isVisible(target);
const title = await this.title();

// Web-First Assertions (preferred in tests)
await this.expectVisible(target);
await this.expectText(target, expected);
await this.expectUrl(urlOrMatcher);
await this.expectTitle(expected);

// Diagnostics
await this.takeScreenshot(name);
```

### Example: Complete Page Object

```typescript
import { BasePage } from './base-page';

export class CheckoutPage extends BasePage {
  // Selectors (using Locators or strings)
  private readonly cartButton = '[data-testid="cart-btn"]';
  private readonly checkoutButton = 'button:has-text("Checkout")';
  private readonly emailInput = '#email';
  private readonly priceTotal = '[data-testid="total-price"]';

  // Navigation
  async open() {
    await this.goto('/checkout');
  }

  // User interactions
  async enterEmail(email: string) {
    await this.fillInput(this.emailInput, email);
  }

  async proceedToPayment() {
    await this.click(this.checkoutButton);
    // Wait for payment page to load
    await this.waitForUrl(/payment/);
  }

  // Assertions
  async expectTotalPrice(expected: string | RegExp) {
    await this.expectText(this.priceTotal, expected);
  }

  async expectCartVisible() {
    await this.expectVisible(this.cartButton);
  }

  // Business workflow
  async completeCheckout(email: string) {
    await this.open();
    await this.enterEmail(email);
    await this.proceedToPayment();
  }
}
```

### Best Practice: Locator Selectors

**Prefer these (in order):**

1. **data-testid** — Explicit, stable IDs added by developers
   ```typescript
   '[data-testid="login-button"]'
   ```

2. **Role + name** — Accessible, semantic HTML
   ```typescript
   'role=button[name="Login"]'
   ```

3. **CSS/XPath** — Last resort if above aren't available
   ```typescript
   'button.primary'
   ```

---

## Running Tests

### Common Commands

```bash
# Run all tests (all 3 browsers)
npm test

# Run with visible browser window
npm run test:headed

# Interactive UI mode (can pause, step through)
npm run test:debug

# UI mode with full dashboard
npm run test:ui

# Run specific browser
BROWSER_TYPE=firefox npm test
# or
npx playwright test --project=firefox

# Run specific test file
npx playwright test tests/example.spec.ts

# Run specific test by name
npx playwright test -g "get started link"

# Run & open HTML report
npm test && npm run report

# View last trace
npm run trace
```

### CLI Flags

```bash
# Headless mode
npx playwright test --headed

# Debug mode (Playwright Inspector)
npx playwright test --debug

# Interactive mode with UI
npx playwright test --ui

# Show browser for 1 second per action (slow-mo)
npx playwright test --headed --workers=1 --headed

# Retry all failed tests
npx playwright test --workers=1

# Run only first test
npx playwright test --max-failures=1
```

### Filtering Tests

```bash
# By file
npx playwright test tests/login

# By test name (regex)
npx playwright test -g "can login"

# By project
npx playwright test --project=chromium

# By tag (if tests use @tag decorator)
npx playwright test --grep @smoke
```

---

## Configuration Management

### The `.env` File

All runtime configuration is controlled by environment variables. Create a `.env` file (from `.env.example`):

```bash
# Base URL for tests
BASE_URL=https://example.com

# Browser selection (chromium|firefox|webkit, leave blank for all)
BROWSER_TYPE=chromium

# Run headless (true|false)
HEADLESS=false

# Custom user agent
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36

# Launch arguments (comma-separated)
LAUNCH_ARGS=--disable-blink-features=AutomationControlled

# Enable detailed logging
VERBOSE_LOGS=false

# Output directories
VIDEO_DIR=test-results/videos
SCREENSHOT_DIR=test-results/screenshots
TEST_DATA_DIR=test_data
```

### Using Env Variables in Code

Import from `hooks/env.ts`:

```typescript
import { BASE_URL, HEADLESS, VERBOSE_LOGS } from '../hooks/env';

if (VERBOSE_LOGS) {
  console.log('Running in verbose mode');
}
```

### Configuration Hierarchy

```
.env (local)
  ↓ loaded by
hooks/env.ts (typed constants)
  ↓ consumed by
playwright.config.ts (browser options)
  ↓ applied to
all tests
```

### playwright.config.ts Overview

The main configuration file controls:

- **Projects** — Which browsers to run (Chromium, Firefox, WebKit)
- **Timeouts** — How long tests/assertions can take
- **Reporters** — Where results go (console, HTML, CI)
- **Screenshots/Videos/Traces** — Failure diagnostics
- **Base URL** — Default URL for page.goto('')

You typically **don't edit** this; instead, control behavior via `.env`.

---

## Test Data Management (Excel)

The framework includes utilities to load test data from Excel files (`.xlsx`).

### Setup

1. **Create a `.xlsx` file** in `test_data/` (e.g., `test-data.xlsx`)
2. **Structure sheets** with headers and rows
3. **Load data in tests** using `readSheetAsObjects()`

### Example: Excel File Structure

| Login Sheet | |  | | Search Sheet | |
|---|---|---|---|---|---|
| username | password | expectedResult | | searchTerm | expectedResult |
| user1@example.com | Pass123! | success | | playwright | 5000+ results |
| invalid | wrong | failure | | github | 20000+ results |

### Using Excel Data in Tests

```typescript
import { readSheetAsObjects } from '../hooks/excel-utils';

interface LoginData {
  username: string;
  password: string;
  expectedResult: string;
}

test('data-driven login', async ({ loginPage }) => {
  // Load data once before all iterations
  const rows = (await readSheetAsObjects('test-data.xlsx', 'LoginSheet')) as LoginData[];

  for (const row of rows) {
    await loginPage.open();
    await loginPage.login(row.username, row.password);

    if (row.expectedResult === 'success') {
      await loginPage.expectDashboardVisible();
    } else {
      await loginPage.expectErrorMessage();
    }
  }
});
```

### Excel Utilities

```typescript
// Read data as objects (each row = object with headers as keys)
const rows = await readSheetAsObjects('file.xlsx', 'SheetName');

// Read data as 2D array (raw grid)
const grid = await readSheetAsRows('file.xlsx', 'SheetName');

// Get all sheet names in workbook
const sheetNames = await getSheetNames('file.xlsx');
```

### Best Practices for Excel Test Data

- ✅ Use **column headers** that match TypeScript interfaces
- ✅ Keep **one sheet per test scenario type** (Login, Search, Checkout)
- ✅ Use **descriptive sheet names** (not "Sheet1")
- ✅ Document expected data format with TypeScript interfaces
- ✅ Store `.xlsx` files in `test_data/` directory
- ❌ Don't hardcode test data—use Excel for maintainability

---

## Quality Gates

The framework enforces code quality through three gates:

### 1. TypeScript Type Checking

```bash
npm run typecheck
```

Finds type errors at development time:

```typescript
// Error: Object is possibly 'null'
const name = user.profile.name;  // ❌

// Fixed: type guard
if (user?.profile?.name) {
  const name = user.profile.name;  // ✅
}
```

### 2. Linting (ESLint)

```bash
npm run lint        # Check for issues
npm run lint:fix    # Automatically fix issues
```

Enforces code style and catches common mistakes:

```typescript
// ❌ ESLint error: test.only prevents other tests from running
test.only('specific test', async ({ page }) => { });

// ✅ Removed .only
test('specific test', async ({ page }) => { });
```

### 3. Formatting (Prettier)

```bash
npm run format       # Format all files
npm run format:check # Check formatting (no changes)
```

Ensures consistent code style (indentation, quotes, line length):

```typescript
// Before (messy)
const x  =  { a: 1 , b: 2  }

// After (Prettier)
const x = { a: 1, b: 2 };
```

### CI/CD Pipeline

GitHub Actions runs all three gates before running tests:

```yaml
├─ typecheck ✅
├─ lint ✅
├─ format ✅
└─ tests ✅
```

If any gate fails, the pipeline stops. This prevents bad code from reaching production.

---

## Diagnostics & Debugging

### Automatic Failure Diagnostics

When a test fails, the framework automatically captures:

- **Screenshot** — What the page looked like at failure
- **Video** — Recording of the entire test (only on failure)
- **Trace** — Complete browser trace with logs, network, performance

All stored in `test-results/` directory.

### Viewing Diagnostics

```bash
# View the last HTML report
npm run report

# Open trace viewer for interactive debugging
npm run trace

# View videos
ls test-results/videos/
```

### Debug Mode

```bash
# Run with Playwright Inspector (step through code)
npm run test:debug
```

**Keyboard shortcuts in Inspector:**
- **Step Over** — Execute next line
- **Step Into** — Enter function
- **Step Out** — Exit function
- **Continue** — Run until next breakpoint
- **Pause** — Pause execution

### Verbose Logging

Enable detailed per-test logs:

```bash
# Set environment variable
VERBOSE_LOGS=true npm test

# Or add to .env
VERBOSE_LOGS=true
```

Logs include:
- Browser console messages
- Network requests/responses
- Page errors
- Excel data loading

### Manual Debugging in Tests

Add debugger statements:

```typescript
test('debug example', async ({ page }) => {
  await page.goto('https://example.com');
  await page.pause();  // ← Pauses here; Inspector opens
  // Use Inspector to inspect DOM, evaluate expressions, etc.
});
```

### Taking Screenshots

```typescript
import { test } from '../hooks/fixtures';

test('save screenshots', async ({ homePage }) => {
  await homePage.open();
  await homePage.takeScreenshot('home-page-loaded');
  
  // Screenshot saved to: test-results/screenshots/home-page-loaded.png
});
```

---

## Extending the Framework

### Adding a New Page Object

1. **Create file** `pages/my-feature.page.ts`:

```typescript
import { BasePage } from './base-page';

export class MyFeaturePage extends BasePage {
  async open() {
    await this.goto('/my-feature');
  }

  async clickButton(buttonName: string) {
    await this.click(`button:has-text("${buttonName}")`);
  }
}
```

2. **Register fixture** in `hooks/fixtures.ts`:

```typescript
import { MyFeaturePage } from '../pages/my-feature.page';

export interface TestFixtures extends BrowserTestFixtures {
  myFeature: MyFeaturePage;  // ← Add
}

export const test = browserTest.extend<TestFixtures>({
  myFeature: async ({ page }, use) => {
    await use(new MyFeaturePage(page));
  },
});
```

3. **Use in tests**:

```typescript
import { test } from '../hooks/fixtures';

test('my feature works', async ({ myFeature }) => {
  await myFeature.open();
  await myFeature.clickButton('Submit');
});
```

### Adding Custom Helpers to BasePage

Extend `BasePage` with utility methods used across tests:

```typescript
// pages/base-page.ts
export class BasePage {
  // ... existing methods ...

  async waitForNavigation() {
    await this.page.waitForNavigation();
  }

  async switchToIframe(frameSelector: string) {
    const frameHandle = await this.page.$(frameSelector);
    return await frameHandle?.contentFrame();
  }
}
```

### Adding Custom Fixtures

Create opt-in fixtures for specialized functionality:

```typescript
// hooks/api-fixtures.ts
import { test as base } from './browser-fixtures';

export const test = base.extend({
  apiClient: async ({}, use) => {
    const client = new APIClient(BASE_URL);
    await use(client);
  },
});
```

---

## Best Practices

### 1. **Use Descriptive Test Names**

```typescript
// ❌ Bad
test('login', async ({ page }) => { });

// ✅ Good
test('user can log in with valid credentials', async ({ loginPage }) => {
  await loginPage.login('user@example.com', 'Password123');
  await loginPage.expectDashboardVisible();
});
```

### 2. **One Assertion Per Test**

```typescript
// ❌ Too many assertions
test('homepage loads', async ({ homePage }) => {
  await homePage.open();
  expect(title).toBe('Home');
  expect(logo).toBeVisible();
  expect(button).toBeClickable();
  expect(text).toContain('Welcome');
});

// ✅ Focused test
test('homepage displays welcome message', async ({ homePage }) => {
  await homePage.open();
  await homePage.expectWelcomeMessageVisible();
});
```

### 3. **Use Web-First Assertions**

```typescript
// ❌ Brittle: assumes element exists
expect(await page.$eval('button', el => el.textContent)).toBe('Click');

// ✅ Web-first: auto-waits, cleaner
await expect(page.locator('button')).toHaveText('Click');
```

### 4. **Prefer data-testid Selectors**

```typescript
// ❌ Fragile: depends on CSS implementation
const button = page.locator('div > span > button.primary');

// ✅ Stable: explicit ID for testing
const button = page.locator('[data-testid="login-button"]');
```

### 5. **DRY: Reuse Page Objects**

```typescript
// ❌ Repeated selectors
test('login workflow', async ({ page }) => {
  await page.fill('#email', 'user@example.com');
  await page.fill('#password', 'pass');
  await page.click('button[type="submit"]');
});

// ✅ Encapsulated in page object
test('login workflow', async ({ loginPage }) => {
  await loginPage.login('user@example.com', 'pass');
});
```

### 6. **Group Related Tests**

```typescript
test.describe('Login Page', () => {
  test('user can log in', async ({ loginPage }) => { });
  test('error shown for invalid credentials', async ({ loginPage }) => { });
  test('password field is masked', async ({ loginPage }) => { });
});
```

### 7. **Run Tests in Parallel Safely**

```typescript
// ✅ Safe: each test gets fresh browser context
test('test 1', async ({ page }) => { });
test('test 2', async ({ page }) => { });  // Different page instance

// ⚠️ Risky: shared state across tests
let sharedUser;
test('create user', async () => {
  sharedUser = await createUser();  // Might not be ready in next test
});
```

### 8. **Clean Up After Tests**

```typescript
test.afterEach(async ({ page }) => {
  // Clear cookies, local storage, etc.
  await page.context().clearCookies();
});
```

---

## Troubleshooting

### "Command not found: npm"

**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/). Verify:

```bash
npm --version
node --version
```

### "Playwright browsers not installed"

**Solution:** Run:

```bash
npx playwright install
```

### "Module not found: @playwright/test"

**Solution:** Install dependencies:

```bash
npm install
```

### Tests timeout (60-second limit exceeded)

**Causes:** Slow network, long waits, infinite loops

**Solutions:**
```typescript
// 1. Increase per-test timeout
test.setTimeout(120_000);  // 2 minutes

// 2. Increase assertion timeout in playwright.config.ts
expect: { timeout: 20_000 }  // 20 seconds

// 3. Debug: add page.pause() and inspect
await page.pause();
```

### "Port 3000 already in use"

**Solution:** Kill the process:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Tests pass locally but fail in CI

**Common causes:**
- Different BASE_URL in CI
- Headless mode differences
- Network timeouts
- Missing environment variables

**Solution:** Check `.env` and CI configuration:

```bash
# In CI, ensure .env is set correctly
HEADLESS=true npm test
```

### Browser not launching

**Solution:** Add diagnostics:

```typescript
test('debug launch', async ({ page }) => {
  console.log('Browser:', page.context().browser()?.browserType().name());
  await page.goto('https://example.com');
});
```

### Element not found / Locator failed

**Solution:** Use Playwright Inspector:

```bash
npm run test:debug

# In Inspector, use console to test selectors:
> page.locator('button:has-text("Click")').isVisible()
```

### Flaky tests (inconsistent pass/fail)

**Causes:** Race conditions, timing issues, network flakiness

**Solutions:**
```typescript
// 1. Use web-first assertions (auto-wait)
await expect(page.locator('button')).toBeVisible();

// 2. Wait for conditions explicitly
await page.waitForFunction(() => document.readyState === 'complete');

// 3. Use page.waitForNavigation for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/next"]'),
]);
```

---

## Common Workflows

### Workflow 1: Run Tests Before Committing Code

```bash
# Type check, lint, format, then run tests
npm run typecheck && \
npm run lint && \
npm run format && \
npm test
```

Or create a pre-commit hook (Git):

```bash
# .git/hooks/pre-commit
npm run typecheck && npm run lint && npm test
```

### Workflow 2: Debug a Failing Test

```bash
# 1. Run the specific test in debug mode
npx playwright test tests/failing-test.spec.ts --debug

# 2. Step through code in Inspector
# 3. Inspect DOM with DevTools panel
# 4. Check console logs
# 5. View network activity

# 6. After fixing, verify
npm test tests/failing-test.spec.ts
```

### Workflow 3: Data-Driven Testing Across Multiple Scenarios

```typescript
// 1. Prepare Excel file: test_data/scenarios.xlsx
// Sheets: "LoginScenarios", "CheckoutScenarios"

// 2. Load and iterate
const scenarios = await readSheetAsObjects('scenarios.xlsx', 'LoginScenarios');
for (const scenario of scenarios) {
  // Run test logic
}

// 3. Run
npm test tests/data-driven.spec.ts
```

### Workflow 4: Add Multi-Browser Compatibility Testing

```bash
# Run all 3 browsers
npm test

# Run one browser
BROWSER_TYPE=firefox npm test

# Results show which browser failed
```

### Workflow 5: Generate Test Report for Stakeholders

```bash
# Run tests and generate report
npm test

# Open HTML report
npm run report

# Share test-results/ directory or screenshot
```

### Workflow 6: Set Up Continuous Integration (GitHub Actions)

The repository includes `.github/workflows/playwright.yml`:

```bash
# On every push/PR:
# 1. typecheck ✅
# 2. lint ✅
# 3. format check ✅
# 4. run tests (all 3 browsers) ✅
# 5. upload artifacts (reports, traces) ✅
```

No additional setup needed—just push code!

---

## Summary

This framework provides:

✅ **Low maintenance** — Single source of truth (config.ts)  
✅ **Readable tests** — Page objects + web-first assertions  
✅ **Type safety** — Full TypeScript support  
✅ **Multi-browser** — Test across Chromium, Firefox, WebKit  
✅ **Data-driven** — Excel integration for scenarios  
✅ **Diagnostics** — Screenshots, videos, traces on failure  
✅ **Quality gates** — Typecheck, lint, format enforcement  
✅ **Extensible** — Easy to add new pages, fixtures, utilities  

### Next Steps

1. **Read tests** — Check `tests/example.spec.ts` and `tests/data-driven.spec.ts`
2. **Create a page object** — Add your own in `pages/`
3. **Write a test** — Add to `tests/` and run with `npm test`
4. **Explore fixtures** — Understand `hooks/fixtures.ts`
5. **Run in debug mode** — Use `npm run test:debug` to step through
6. **Add test data** — Create Excel file in `test_data/`

### Getting Help

- **Playwright docs** → https://playwright.dev
- **TypeScript handbook** → https://www.typescriptlang.org/docs/
- **ESLint guide** → https://eslint.org/docs/rules/
- **Framework README** → See [README.md](README.md)

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Maintainer:** QA Team
