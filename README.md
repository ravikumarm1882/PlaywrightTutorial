# Playwright Tutorial — UI Automation Framework

A TypeScript automation framework built on [Playwright Test](https://playwright.dev). It layers a **Page Object Model**, **environment-driven configuration**, opt-in **helper fixtures/utilities**, and an **Excel data-driven** capability on top of Playwright's native runner — with type-checking, linting, and formatting wired in.

The design principle is **config-first**: `playwright.config.ts` is the single source of truth for browser options (headless, viewport, user agent, launch args, trace, screenshot, video, projects). Custom fixtures only add genuine value (page objects, opt-in diagnostics, Excel reading) rather than re-implementing Playwright's own lifecycle.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Quality Gates (typecheck / lint / format)](#quality-gates-typecheck--lint--format)
- [Architecture](#architecture)
- [Writing Tests](#writing-tests)
- [Test Data (Excel)](#test-data-excel)
- [Reports, Traces, Screenshots & Videos](#reports-traces-screenshots--videos)
- [Continuous Integration](#continuous-integration)
- [Extending the Framework](#extending-the-framework)
- [Troubleshooting](#troubleshooting)
- [Additional Documentation](#additional-documentation)

---

## Features

- ✅ **Config-first** — all browser options live in `playwright.config.ts`; native fixtures handle browser/context/page lifecycle (no hand-rolled duplication).
- ✅ **Page Object Model** — a `BasePage` of Locator-based helpers and web-first assertions, extended by page classes.
- ✅ **Environment-driven** — base URL, browser selection, headless mode, user agent, launch args, and directories via a `.env` file.
- ✅ **Multi-browser projects** — Chromium, Firefox, and WebKit as native projects; run all or filter to one.
- ✅ **Opt-in toolkits** — Excel data reader, standalone browser utilities, and API/Auth/Data fixtures.
- ✅ **Failure diagnostics** — trace on first retry, screenshot + video on failure (config-driven), plus an attached failure screenshot and optional verbose logging.
- ✅ **Quality gates** — TypeScript `typecheck`, ESLint, and Prettier with npm scripts and CI enforcement.

---

## Tech Stack

| Component                                                                                                                                                                         | Version            | Purpose                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------- |
| [@playwright/test](https://playwright.dev)                                                                                                                                        | `^1.60.0`          | Test runner & browser automation |
| [TypeScript](https://www.typescriptlang.org/)                                                                                                                                     | `^5.7`             | Language & type checking         |
| [exceljs](https://github.com/exceljs/exceljs)                                                                                                                                     | `^4.4.0`           | Read/write `.xlsx` test data     |
| [dotenv](https://github.com/motdotla/dotenv)                                                                                                                                      | `^16.3.1`          | Environment variable loading     |
| [ESLint](https://eslint.org/) + [typescript-eslint](https://typescript-eslint.io/) + [eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright) | `^9` / `^8` / `^2` | Linting                          |
| [Prettier](https://prettier.io/)                                                                                                                                                  | `^3`               | Formatting                       |
| [@types/node](https://www.npmjs.com/package/@types/node)                                                                                                                          | `^25.9.1`          | Node.js type definitions         |

---

## Project Structure

```
PlaywrightTutorial/
├── .github/workflows/playwright.yml  # CI: typecheck → lint → test
├── hooks/                            # Framework core
│   ├── env.ts                        # Environment configuration loader
│   ├── browser-fixtures.ts           # Thin base test: opt-in page diagnostics
│   ├── fixtures.ts                   # Composed test: page objects + hooks
│   ├── trace-hooks.ts                # registerDiagnosticsHooks(test)
│   ├── extended-fixtures.ts          # Opt-in API/Auth/Data fixtures
│   ├── browser-utils.ts              # Standalone browser helpers
│   └── excel-utils.ts                # Excel (.xlsx) read utility
├── pages/                            # Page Object Model
│   ├── base-page.ts                  # Locator-based base class
│   ├── playwright-home.page.ts
│   └── playwright-installation.page.ts
├── tests/
│   ├── example.spec.ts               # Example test suite
│   └── data-driven.spec.ts           # Excel data-driven example
├── test_data/test-data.xlsx          # Sample test data
├── test-results/                     # Traces, screenshots, videos (generated)
├── playwright-report/                # HTML report (generated)
├── eslint.config.mjs                 # ESLint flat config
├── .prettierrc.json / .prettierignore
├── .env.example
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- **Node.js** — LTS recommended (Node 18+).
- **npm** — bundled with Node.js.
- A supported OS (Windows / macOS / Linux).

---

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install

# 3. (Optional) Create your local environment file
cp .env.example .env     # macOS/Linux
copy .env.example .env   # Windows
```

---

## Configuration

Runtime behavior is controlled through environment variables, loaded by [hooks/env.ts](hooks/env.ts) via `dotenv` and consumed by [playwright.config.ts](playwright.config.ts). Copy [.env.example](.env.example) to `.env` and adjust.

| Variable         | Default                                         | Description                                                                                 |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `BASE_URL`       | `https://playwright.dev`                        | Base URL for `page.goto('')` and page objects.                                              |
| `BROWSER_TYPE`   | _(unset)_                                       | `chromium` \| `firefox` \| `webkit`. **Unset → run all projects;** set → run just that one. |
| `HEADLESS`       | `false`                                         | Run headless when `true`.                                                                   |
| `VERBOSE_LOGS`   | `false`                                         | Print per-test console/network/page-error/Excel diagnostics when `true`.                    |
| `USER_AGENT`     | a desktop Chrome UA                             | User agent applied to all contexts.                                                         |
| `VIDEO_DIR`      | `test-results/videos`                           | (Used by helper utilities.)                                                                 |
| `SCREENSHOT_DIR` | `test-results/screenshots`                      | Output dir for `takeScreenshot()`.                                                          |
| `TEST_DATA_DIR`  | `test_data`                                     | Root directory for Excel/test-data files.                                                   |
| `LAUNCH_ARGS`    | `--disable-blink-features=AutomationControlled` | Comma-separated launch args.                                                                |

> **Single source of truth:** `playwright.config.ts` applies `baseURL`, `headless`, `viewport`, `userAgent`, `launchOptions.args`, timeouts, `testIdAttribute`, and the diagnostics policy (`trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`). Change browser behavior there, not in fixtures.

---

## Running Tests

| Command               | Description                                      |
| --------------------- | ------------------------------------------------ |
| `npm test`            | Run all tests (all configured browser projects). |
| `npm run test:headed` | Run with a visible browser.                      |
| `npm run test:debug`  | Run with the Playwright Inspector.               |
| `npm run test:ui`     | Open interactive UI mode.                        |
| `npm run report`      | Open the last HTML report.                       |
| `npm run trace`       | Open the trace viewer.                           |

```bash
# Run a single browser project
npx playwright test --project=chromium

# Or filter via env (matches the project name)
BROWSER_TYPE=firefox npx playwright test

# Run a single file / by title
npx playwright test tests/example.spec.ts
npx playwright test -g "get started link"
```

---

## Quality Gates (typecheck / lint / format)

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run typecheck`    | `tsc --noEmit` — full type check.              |
| `npm run lint`         | ESLint (typescript-eslint + Playwright rules). |
| `npm run lint:fix`     | ESLint with autofix.                           |
| `npm run format`       | Prettier write.                                |
| `npm run format:check` | Prettier check (no writes).                    |

`typecheck` and `lint` also run in CI before the test step.

---

## Architecture

Layers compose from configuration up to specs:

```
tests/*.spec.ts
   │ import { test, expect }
   ▼
hooks/fixtures.ts        ← adds page-object fixtures + registers diagnostics hooks
   │ extends
   ▼
hooks/browser-fixtures.ts ← thin base test; opt-in page event logging only
   │ (native browser/context/page come from…)
   ▼
playwright.config.ts     ← single source of truth for browser options + projects
   ▲ reads
hooks/env.ts             ← typed .env values

pages/*.page.ts → pages/base-page.ts   (Locator-based POM, web-first assertions)
hooks/excel-utils.ts                     (Excel data reader)
hooks/browser-utils.ts                   (standalone helpers)
hooks/extended-fixtures.ts               (opt-in API/Auth/Data fixtures)
```

- **[playwright.config.ts](playwright.config.ts)** — defines `use` options and a 3-browser project matrix (`chromium`/`firefox`/`webkit` via `devices`). `BROWSER_TYPE` filters to one project; unset runs all. Sets timeouts, `outputDir`, and the `[list, html]` reporters.
- **[hooks/env.ts](hooks/env.ts)** — loads `.env` and exports typed constants.
- **[hooks/browser-fixtures.ts](hooks/browser-fixtures.ts)** — `browserTest` extends the base test and overrides the native `page` _only_ to attach `pageerror`/`console`/network listeners, gated behind `VERBOSE_LOGS`. The lifecycle itself is Playwright's.
- **[hooks/trace-hooks.ts](hooks/trace-hooks.ts)** — exports `registerDiagnosticsHooks(test)`, registered against the project `test` in `fixtures.ts` so it actually runs; logs start (verbose) and attaches a screenshot on failure.
- **[hooks/fixtures.ts](hooks/fixtures.ts)** — the `test`/`expect` that specs import; adds the `homePage` page-object fixture.
- **[pages/base-page.ts](pages/base-page.ts)** — Locator-based helpers (`click`, `fillInput`, `getText`, `waitForElement`) plus web-first assertions (`expectVisible`, `expectText`, `expectTitle`, `expectUrl`) and utilities (`takeScreenshot`, `clearStorage`, etc.). Methods accept a selector string or a Locator.
- **Opt-in toolkits** — [hooks/excel-utils.ts](hooks/excel-utils.ts), [hooks/browser-utils.ts](hooks/browser-utils.ts), and [hooks/extended-fixtures.ts](hooks/extended-fixtures.ts) (a production-ready `apiClient` that checks status and tolerates non-JSON, plus clearly-marked Auth/Data example stubs).

---

## Writing Tests

Import `test`/`expect` from the composed fixtures and use page objects:

```typescript
import { test } from '../hooks/fixtures';

test.describe('Playwright Website Tests', () => {
  test('has title', async ({ homePage }) => {
    await homePage.open();
    await homePage.expectTitle(/Playwright/);
  });

  test('get started link', async ({ homePage }) => {
    await homePage.open();
    const installationPage = await homePage.clickGetStarted();
    await installationPage.expectInstallationHeadingVisible();
  });
});
```

Using the raw `page` fixture with standalone utilities:

```typescript
import { test, expect } from '../hooks/fixtures';
import { navigateTo, retryOperation } from '../hooks/browser-utils';

test('utility-driven', async ({ page }) => {
  await navigateTo(page, 'https://example.com');
  await retryOperation(() => page.getByRole('link').first().click());
});
```

---

## Test Data (Excel)

Data-driven testing from `.xlsx` files via [exceljs](https://github.com/exceljs/exceljs).

### Sample workbook

A sample file is committed at [test_data/test-data.xlsx](test_data/test-data.xlsx):

| Sheet        | Columns                                  | Purpose                  |
| ------------ | ---------------------------------------- | ------------------------ |
| `LoginData`  | `username`, `password`, `expectedResult` | Credential-driven cases. |
| `SearchData` | `searchTerm`, `expectedResult`           | Search-term cases.       |

Drop your own `.xlsx` files into `test_data/` (configurable via `TEST_DATA_DIR`) and read them with the utility below.

### Read utility — [hooks/excel-utils.ts](hooks/excel-utils.ts)

Async helpers; pass a bare file name (resolved against `TEST_DATA_DIR`) or an absolute path.

| Function                          | Returns                              | Description                                           |
| --------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `readSheetAsObjects(file, sheet)` | `Promise<Record<string, unknown>[]>` | First row = headers; rows → objects. **Primary API.** |
| `readSheetAsRows(file, sheet)`    | `Promise<unknown[][]>`               | Raw 2D array.                                         |
| `getSheetNames(file)`             | `Promise<string[]>`                  | Sheet names.                                          |
| `getCellValue(file, sheet, cell)` | `Promise<unknown>`                   | One cell by address (e.g. `"B2"`).                    |
| `resolveDataPath(file)`           | `string`                             | Resolve against `TEST_DATA_DIR`.                      |

Cell values are normalized (rich text, formula results, hyperlinks, dates → plain JS values).

### Usage

exceljs reads asynchronously, so load data inside a hook/test (not the synchronous `describe` step). See [tests/data-driven.spec.ts](tests/data-driven.spec.ts):

```typescript
import { test, expect } from '../hooks/fixtures';
import { readSheetAsObjects } from '../hooks/excel-utils';

interface LoginRow {
  username: string;
  password: string;
  expectedResult: string;
}

test.describe('Data-driven login', () => {
  let loginRows: LoginRow[] = [];

  test.beforeAll(async () => {
    loginRows = (await readSheetAsObjects('test-data.xlsx', 'LoginData')) as unknown as LoginRow[];
    expect(loginRows.length).toBeGreaterThan(0);
  });

  test('drive each row', async ({ homePage }) => {
    await homePage.open();
    for (const row of loginRows) {
      expect(['success', 'failure']).toContain(row.expectedResult);
    }
  });
});
```

---

## Reports, Traces, Screenshots & Videos

Configured in [playwright.config.ts](playwright.config.ts):

- **HTML report** → `playwright-report/` — `npm run report`.
- **Traces** (`on-first-retry`) → `test-results/` — `npm run trace` or the report's "View trace".
- **Screenshots** (`only-on-failure`) → `test-results/`; `BasePage.takeScreenshot()` writes to `SCREENSHOT_DIR`.
- **Videos** (`retain-on-failure`) → `test-results/`.
- A **failure screenshot** is also attached to the report by the diagnostics hook.

See [TRACE_VIEWER_SETUP.md](TRACE_VIEWER_SETUP.md).

---

## Continuous Integration

[.github/workflows/playwright.yml](.github/workflows/playwright.yml) runs on push/PR to `main`/`master`:

1. Checkout + Node LTS, `npm ci`.
2. **`npm run typecheck`** and **`npm run lint`** (quality gates).
3. `npx playwright install --with-deps`.
4. `npx playwright test`.
5. Upload `playwright-report/` artifact (30-day retention).

On CI the runner also enables `forbidOnly`, `retries: 2`, and `workers: 1`.

---

## Extending the Framework

- **Add a page object:** create `pages/<name>.page.ts` extending `BasePage`; declare Locators in the constructor; expose intent-revealing methods and `expect*` assertions.
- **Expose it as a fixture:** add it to `TestFixtures` in [hooks/fixtures.ts](hooks/fixtures.ts) and wire it in `test.extend({...})`.
- **Add a browser:** projects are defined in [playwright.config.ts](playwright.config.ts); select with `--project` or `BROWSER_TYPE`.
- **Custom fixtures:** follow [hooks/extended-fixtures.ts](hooks/extended-fixtures.ts) (replace the stub bodies with real clients).
- **Keep it green:** run `npm run typecheck && npm run lint && npm run format` before pushing.

---

## Troubleshooting

| Symptom                      | Fix                                                          |
| ---------------------------- | ------------------------------------------------------------ |
| `Executable doesn't exist`   | Run `npx playwright install`.                                |
| Tests open a visible browser | Set `HEADLESS=true` in `.env`.                               |
| Tests run 3× (all browsers)  | Set `BROWSER_TYPE` or pass `--project=chromium`.             |
| Want detailed per-test logs  | Set `VERBOSE_LOGS=true`.                                     |
| `.env` changes not applied   | Ensure the file is named exactly `.env` at the project root. |
| Type/lint failures locally   | `npm run typecheck`, `npm run lint:fix`, `npm run format`.   |

---

## Additional Documentation

- [TRACE_VIEWER_SETUP.md](TRACE_VIEWER_SETUP.md) — trace viewer setup.
- [Playwright Official Docs](https://playwright.dev) — upstream reference.
