# Playwright Trace Viewer Setup

## Overview
This project is configured to capture detailed traces of your Playwright test executions. Traces include:
- Network requests and responses
- Console messages
- Screenshots
- Videos (on failures)
- DOM snapshots
- Timing information

## Trace Configuration

The trace settings in `playwright.config.ts`:
- **trace**: `'retain-on-failure'` - Traces are only saved when tests fail
- **screenshot**: `'only-on-failure'` - Screenshots captured on test failures
- **video**: `'retain-on-failure'` - Videos recorded only for failed tests

## Running Tests with Traces

### Run all tests with trace collection
```bash
npm test
```

### Run tests in headed mode (visible browser)
```bash
npm run test:headed
```

### Run tests in debug mode (interactive)
```bash
npm run test:debug
```

### Run tests in UI mode (interactive test runner)
```bash
npm run test:ui
```

## Viewing Traces

### View the HTML Report
After running tests, view the interactive HTML report which includes traces:
```bash
npm run report
```

This opens `playwright-report/index.html` in your browser.

### View Individual Traces
If you have a specific trace file:
```bash
npm run trace ./test-results/trace.zip
```

### Via Playwright Inspector
When running in debug mode:
```bash
npm run test:debug
```

## Trace File Locations

Traces are saved in: `test-results/` directory

Files generated:
- `*.zip` - Trace files (contain full execution details)
- `*.png` - Screenshots (on failure)
- `*.webm` - Video files (on failure)

## Analyzing Traces

1. **Failed Test Traces**: Automatically collected and viewable in the HTML report
2. **Click "View trace"** in the HTML report to open the full trace viewer
3. **Inspect** each action, network call, and DOM state

## Trace Information Available

- **Timeline**: Complete sequence of test actions
- **Network**: All HTTP requests/responses
- **Console**: Browser console logs
- **Screenshots**: Visual state at each action
- **DOM**: DOM snapshots at key points
- **Metadata**: Timing and performance data

## Tips for Effective Tracing

1. **Always check failed test traces** - They contain valuable debugging info
2. **Use trace viewer to find timing issues** - See exactly where delays occur
3. **Compare network requests** - Debug API-related failures
4. **Reference screenshots** - Visual confirmation of test state

## Debugging a Failed Test

1. Run: `npm test`
2. Open report: `npm run report`
3. Find failed test in the report
4. Click "View trace" 
5. Navigate through timeline to identify failure point
6. Check network tab for failed requests
7. Review console for errors

## Example: Viewing Specific Test Trace

```bash
# Run a specific test
npx playwright test tests/example.spec.ts

# View the report with traces
npm run report
```
