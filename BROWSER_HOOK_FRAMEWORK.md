# Browser Hook Framework Setup

## Overview

A comprehensive hook-based framework for managing Browser, BrowserContext, and Page lifecycle in Playwright tests. This framework provides:

- Automatic browser instance lifecycle management
- Per-test context isolation
- Per-test page creation and teardown
- Built-in tracing for each test
- Console and network logging
- Common browser operations utilities
- Proper resource cleanup

## Architecture

### Components

#### 1. **hooks/fixtures.ts** - Test Fixtures
Defines the extended test fixtures:
- `browser` - Browser instance (shared/reused)
- `context` - BrowserContext (created per test)
- `page` - Page (created per test)
- `browserType` - Override browser type (chromium, firefox, webkit)

#### 2. **hooks/browser-utils.ts** - Browser Utilities
Common operations:
- Navigation: `navigateTo()`
- Element interactions: `clickElement()`, `fillInput()`, `waitForElement()`
- Utilities: `takeScreenshot()`, `setViewport()`, `executeScript()`
- Retry logic: `retryOperation()`
- Storage management: `clearStorage()`, `setAuthHeader()`
- Assertions: `assertMultiple()`

#### 3. **hooks/trace-hooks.ts** - Trace Hooks (from previous setup)
Manages trace context and logging.

## Usage

### Basic Test
```typescript
import { test, expect } from '../hooks/fixtures';
import { navigateTo, clickElement } from '../hooks/browser-utils';

test('my test', async ({ page, browser, context }) => {
  // page is created fresh for this test
  // context is created fresh for this test
  // browser instance is reused (managed globally)
  
  await navigateTo(page, 'https://example.com');
  await clickElement(page, 'button');
  
  // Automatic cleanup happens after test
});
```

### Using Browser Utilities
```typescript
import { 
  navigateTo, 
  fillInput, 
  clickElement,
  getElementText,
  takeScreenshot,
  retryOperation
} from '../hooks/browser-utils';

test('form submission', async ({ page }) => {
  await navigateTo(page, 'https://example.com/form');
  
  // Fill form
  await fillInput(page, '#email', 'user@example.com');
  await fillInput(page, '#password', 'password123');
  
  // Submit with retry
  await retryOperation(async () => {
    await clickElement(page, 'button[type="submit"]');
    await page.waitForURL('https://example.com/success');
  });
  
  // Get text
  const welcomeText = await getElementText(page, 'h1');
  expect(welcomeText).toContain('Welcome');
  
  // Screenshot
  await takeScreenshot(page, 'success-page');
});
```

### Override Browser Type Per Test
```typescript
test('firefox test', async ({ page }) => {
  // This test will use firefox instead of chromium
  await navigateTo(page, 'https://example.com');
}, {
  // Override browser type for this test
  // This requires test config to handle it, see below
});
```

## Lifecycle

### Before Each Test
1. Browser instance acquired/created (reused)
2. BrowserContext created (isolated)
3. Page created (fresh)
4. Tracing started
5. Event listeners attached (console, errors, network)

### During Test
- Automatic logging of console messages
- Network request/response logging
- Trace capture
- Screenshot/video capture on failure

### After Each Test
1. Trace stopped and saved (tagged with test name)
2. Page closed
3. BrowserContext closed
4. Browser instance kept for next test

### After All Tests
- All browser instances closed
- Resources cleaned up

## Logging

The framework provides comprehensive logging:

### Browser Logs
```
[Browser] Launching chromium browser...
[Browser] Browser instance ready
```

### Context Logs
```
[Context] Creating new browser context for test: my test
[Context] Context created and tracing started
[Context] Stopping trace and closing context...
[Context] Context closed
```

### Page Logs
```
[Page] Creating new page for test: my test
[Page] Page created successfully
[Page] Closing page...
[Page] Page closed
```

### Action Logs
```
[Navigation] Going to https://example.com
[Navigation] Loaded https://example.com
[Click] Clicking element: button
[Console] LOG: User clicked button
[Network] Request: POST https://api.example.com/data
```

## Trace Files

Traces are saved per test:
- Location: `test-results/`
- Pattern: `trace-{test-name}-{timestamp}.zip`
- Includes: Screenshots, snapshots, sources, timing

View traces:
```bash
npm run report
```

## Configuration

### Default Viewport
```typescript
// In fixtures.ts - adjust in context fixture:
viewport: { width: 1280, height: 720 }
```

### Launch Options
```typescript
// In fixtures.ts - adjust getBrowserInstance():
let launchOptions = {
  headless: true,
  args: [
    '--disable-blink-features=AutomationControlled',
  ],
};
```

### Tracing Options
```typescript
// In fixtures.ts - adjust context fixture:
await context.tracing.start({
  screenshots: true,
  snapshots: true,
  sources: true,
});
```

## Best Practices

1. **Import from fixtures** - Always use `test` from `../hooks/fixtures`
2. **Use browser-utils** - Leverage utilities for common operations
3. **Meaningful test names** - Used in logging and trace filenames
4. **Organize tests** - Group related tests in `test.describe()` blocks
5. **Check logs** - Review console output for detailed execution info
6. **Inspect traces** - Use HTML report to debug failures

## Examples

### Example 1: Login Flow with Retry
```typescript
import { test } from '../hooks/fixtures';
import { navigateTo, fillInput, clickElement, retryOperation } from '../hooks/browser-utils';

test('login flow', async ({ page }) => {
  await navigateTo(page, 'https://app.example.com/login');
  
  await retryOperation(async () => {
    await fillInput(page, '#username', 'testuser');
    await fillInput(page, '#password', 'testpass123');
    await clickElement(page, 'button[type="submit"]', true); // wait for navigation
    
    // Verify we're logged in
    await page.waitForURL('https://app.example.com/dashboard');
  }, 3, 2000);
});
```

### Example 2: Multi-Browser Testing
```typescript
// Create separate files for each browser type:
// tests/cross-browser.spec.ts

import { test } from '../hooks/fixtures';

test.describe('Cross-browser tests', () => {
  test('chromium test', async ({ page, browserType }) => {
    expect(browserType).toBe('chromium');
    // test code
  });
});
```

### Example 3: Screenshot Comparison
```typescript
import { test } from '../hooks/fixtures';
import { navigateTo, takeScreenshot, setViewport } from '../hooks/browser-utils';

test('responsive design', async ({ page }) => {
  await navigateTo(page, 'https://example.com');
  
  // Desktop view
  await setViewport(page, 1920, 1080);
  await takeScreenshot(page, 'desktop-view');
  
  // Mobile view
  await setViewport(page, 375, 667);
  await takeScreenshot(page, 'mobile-view');
});
```

## Troubleshooting

### Tests Hanging
- Check if page.waitForNavigation() is needed
- Use retryOperation() for flaky interactions
- Check network tab in trace

### Browser Not Closing
- Ensure tests complete without hanging
- Check for infinite loops or missing await statements
- Monitor for memory leaks

### Trace Not Captured
- Verify context.tracing.start() is called
- Ensure test completes
- Check test-results/ directory

### Console Logs Not Showing
- Logs are printed to terminal during test execution
- Use `npm run test:headed` to see live browser output
- Check HTML report for detailed logs

## File Structure
```
hooks/
  fixtures.ts           - Test fixtures (page, browser, context)
  browser-utils.ts      - Common browser operations
  trace-hooks.ts        - Trace management hooks

tests/
  example.spec.ts       - Example tests using new framework

test-results/
  trace-*.zip           - Trace files
  videos/               - Failed test videos
  screenshots/          - Captured screenshots
```
