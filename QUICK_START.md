# Browser Hook Framework - Quick Start Guide

## What's New

Your Playwright project now has a comprehensive hook-based framework for browser lifecycle management:

### New Files Created

1. **hooks/fixtures.ts** - Core test fixtures
   - Browser instance management
   - Context creation/cleanup
   - Page creation/cleanup
   - Automatic tracing
   - Event listeners (console, errors, network)

2. **hooks/browser-utils.ts** - Browser utilities library
   - 15+ common browser operations
   - Retry logic with exponential backoff
   - Screenshot and storage management
   - Console capture and assertions

3. **hooks/extended-fixtures.ts** - Advanced fixtures
   - API client fixture
   - Authentication fixture
   - Database fixture
   - Test data factory

4. **BROWSER_HOOK_FRAMEWORK.md** - Comprehensive documentation

5. **Updated tests/example.spec.ts** - Uses new framework

## Quick Start (5 minutes)

### 1. Run Tests with New Framework
```bash
npm test
```

### 2. View Results
```bash
npm run report
```

### 3. Create Your First Test

Replace test content with:
```typescript
import { test, expect } from '../hooks/fixtures';
import { navigateTo, clickElement, getElementText } from '../hooks/browser-utils';

test('example test', async ({ page, browser, context }) => {
  console.log('Starting test...');
  
  // Navigate
  await navigateTo(page, 'https://example.com');
  
  // Interact
  await clickElement(page, 'button');
  
  // Assert
  const text = await getElementText(page, 'h1');
  expect(text).toContain('Expected text');
  
  console.log('Test passed!');
  // Auto cleanup happens here
});
```

## Key Features

### ✅ Automatic Lifecycle Management
- Browser instance reused across tests
- Context created fresh per test
- Page created fresh per test
- Automatic cleanup after each test

### ✅ Built-in Tracing
- Trace captured for each test
- Saved with test name and timestamp
- Automatic screenshots on failure
- Network logging

### ✅ Comprehensive Logging
- Browser logs: `[Browser] ...`
- Context logs: `[Context] ...`
- Page logs: `[Page] ...`
- Action logs: `[Click]`, `[Navigation]`, etc.
- Console logs: `[Console] ...`
- Network logs: `[Network] ...`

### ✅ Browser Utilities
Ready-to-use functions:
- `navigateTo()` - Navigate with wait conditions
- `clickElement()` - Click with optional navigation wait
- `fillInput()` - Fill form fields
- `getElementText()` - Get element content
- `isElementVisible()` - Check visibility
- `takeScreenshot()` - Save screenshots
- `setViewport()` - Change viewport
- `executeScript()` - Run JS in page context
- `retryOperation()` - Retry with backoff
- `clearStorage()` - Clear cookies/storage
- `setAuthHeader()` - Set auth headers
- `captureConsoleLogs()` - Capture console output
- `assertMultiple()` - Assert multiple conditions

## File Organization

```
hooks/
├── fixtures.ts              ← Core fixtures (page, browser, context)
├── browser-utils.ts         ← Common browser operations
├── extended-fixtures.ts     ← Advanced fixtures (API, Auth, DB, etc)
└── trace-hooks.ts           ← Trace management

tests/
└── example.spec.ts          ← Example tests (updated)

test-results/
├── trace-*.zip              ← Trace files
├── screenshots/             ← Captured screenshots
└── videos/                  ← Failed test videos
```

## Common Patterns

### Pattern 1: Basic Test
```typescript
test('basic test', async ({ page }) => {
  await navigateTo(page, 'https://example.com');
  // test code
});
```

### Pattern 2: Test with Error Handling
```typescript
test('test with retry', async ({ page }) => {
  await retryOperation(async () => {
    await clickElement(page, 'button');
    await page.waitForURL('**/success');
  });
});
```

### Pattern 3: Test with Assertions
```typescript
test('assertions', async ({ page }) => {
  const visible = await isElementVisible(page, 'h1');
  const text = await getElementText(page, 'p');
  
  await assertMultiple([
    { condition: visible, message: 'Header should be visible' },
    { condition: text.includes('Test'), message: 'Text should contain "Test"' },
  ]);
});
```

### Pattern 4: Screenshots
```typescript
test('screenshots', async ({ page }) => {
  await navigateTo(page, 'https://example.com');
  await takeScreenshot(page, 'homepage');
  await clickElement(page, 'button');
  await takeScreenshot(page, 'after-click');
});
```

## Debugging

### 1. Check Console Logs
Run tests and watch the terminal for detailed logs:
```bash
npm run test:headed
```

### 2. Debug Mode with Inspector
```bash
npm run test:debug
```

### 3. View Trace
```bash
npm run report
```
Click "View trace" on failed tests

### 4. Check Test Results
```bash
test-results/
├── trace-{test-name}.zip    ← Full trace
├── screenshots/             ← Captured images
└── videos/                  ← Failed test videos
```

## Next Steps

1. **Read Full Documentation**: [BROWSER_HOOK_FRAMEWORK.md](BROWSER_HOOK_FRAMEWORK.md)
2. **Update Your Tests**: Use new fixtures in your test files
3. **Extend Fixtures**: Add custom fixtures using [extended-fixtures.ts](hooks/extended-fixtures.ts)
4. **Configure**: Adjust launch options, viewport, or tracing in [fixtures.ts](hooks/fixtures.ts)

## Configuration

### Change Viewport Size
Edit `hooks/fixtures.ts`:
```typescript
viewport: { width: 1920, height: 1080 } // Change these values
```

### Enable Headless/Headed Mode
Edit `hooks/fixtures.ts`:
```typescript
let launchOptions = {
  headless: false, // Change to false for headed mode
};
```

### Disable Tracing
Edit `hooks/fixtures.ts` - comment out in context fixture:
```typescript
// await context.tracing.start({...});
```

## Support

For detailed information, refer to:
- [BROWSER_HOOK_FRAMEWORK.md](./BROWSER_HOOK_FRAMEWORK.md) - Complete documentation
- [hooks/fixtures.ts](./hooks/fixtures.ts) - Fixture implementation
- [hooks/browser-utils.ts](./hooks/browser-utils.ts) - Utilities documentation
- [tests/example.spec.ts](./tests/example.spec.ts) - Example tests

## Summary

Your Playwright framework now has:
✅ Automatic browser/context/page lifecycle management
✅ Built-in tracing for all tests
✅ 15+ ready-to-use browser utilities
✅ Comprehensive logging
✅ Advanced fixtures for APIs, authentication, databases
✅ Professional-grade test infrastructure

Start writing tests! 🚀
