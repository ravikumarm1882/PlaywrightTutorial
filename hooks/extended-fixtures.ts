import { test, type TestFixtures } from './fixtures';

/**
 * Opt-in fixtures for advanced scenarios, built on top of the base `test`.
 *
 * - `apiClient` is production-ready (checks response status, tolerates non-JSON).
 * - `authenticate`, `db`, and `dataFactory` are EXAMPLE STUBS that show the
 *   shape of such fixtures. Replace their bodies with your real selectors /
 *   client libraries before relying on them.
 */

/** Result of an API call: HTTP status plus parsed body (JSON when possible). */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  body: T;
}

export interface ApiClient {
  get<T = unknown>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>>;
  delete<T = unknown>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>>;
}

interface APIClientFixture extends TestFixtures {
  apiClient: ApiClient;
}

/**
 * API client fixture — makes requests through the test's browser context so
 * cookies/auth are shared with the UI session.
 */
export const testWithAPI = test.extend<APIClientFixture>({
  apiClient: async ({ context }, use) => {
    async function parse<T>(
      response: import('@playwright/test').APIResponse,
    ): Promise<ApiResponse<T>> {
      const text = await response.text();
      let body: unknown = text;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        // Non-JSON response — keep the raw text.
      }
      return { ok: response.ok(), status: response.status(), body: body as T };
    }

    const client: ApiClient = {
      async get(url, headers) {
        return parse(await context.request.get(url, { headers }));
      },
      async post(url, data, headers) {
        return parse(await context.request.post(url, { data, headers }));
      },
      async put(url, data, headers) {
        return parse(await context.request.put(url, { data, headers }));
      },
      async delete(url, headers) {
        return parse(await context.request.delete(url, { headers }));
      },
    };

    await use(client);
  },
});

/**
 * Authentication fixture (EXAMPLE STUB).
 * Replace selectors/URLs with your application's real login flow.
 */
interface AuthFixture extends TestFixtures {
  authenticate: {
    loginWith(email: string, password: string): Promise<void>;
    logout(): Promise<void>;
  };
}

export const testWithAuth = test.extend<AuthFixture>({
  authenticate: async ({ page }, use) => {
    await use({
      async loginWith(email: string, password: string) {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill(email);
        await page.getByLabel(/password/i).fill(password);
        await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
        await page.waitForURL('**/dashboard');
      },
      async logout() {
        await page.getByTestId('logout-button').click();
        await page.waitForURL('**/login');
      },
    });
  },
});

/**
 * Test-data factory fixture (EXAMPLE STUB).
 * Uses a deterministic incrementing id rather than Math.random().
 */
interface DataFactoryFixture extends TestFixtures {
  dataFactory: {
    createUser(overrides?: Record<string, unknown>): Record<string, unknown>;
    createProduct(overrides?: Record<string, unknown>): Record<string, unknown>;
  };
}

export const testWithData = test.extend<DataFactoryFixture>({
  dataFactory: async ({}, use) => {
    let seq = 0;
    const nextId = () => ++seq;

    await use({
      createUser(overrides) {
        const id = nextId();
        return {
          id,
          email: `user${id}@example.com`,
          firstName: 'Test',
          lastName: 'User',
          ...overrides,
        };
      },
      createProduct(overrides) {
        const id = nextId();
        return {
          id,
          name: `Test Product ${id}`,
          price: 99.99,
          description: 'A test product',
          ...overrides,
        };
      },
    });
  },
});

/**
 * Example usage:
 *
 *   import { testWithAPI } from '../hooks/extended-fixtures';
 *
 *   testWithAPI('api test', async ({ apiClient }) => {
 *     const res = await apiClient.get('https://api.example.com/data');
 *     expect(res.ok).toBeTruthy();
 *   });
 */
