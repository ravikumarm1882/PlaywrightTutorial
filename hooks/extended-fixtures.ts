import { Page, BrowserContext, test as base } from '@playwright/test';
import { test, TestFixtures } from './fixtures';

/**
 * Extended fixtures for advanced scenarios
 * Build on top of base fixtures to add custom functionality
 */

/**
 * API client fixture interface
 */
interface APIClientFixture extends TestFixtures {
  apiClient: {
    get(url: string, headers?: Record<string, string>): Promise<any>;
    post(url: string, data?: any, headers?: Record<string, string>): Promise<any>;
    put(url: string, data?: any, headers?: Record<string, string>): Promise<any>;
    delete(url: string, headers?: Record<string, string>): Promise<any>;
  };
}

/**
 * Example: API client fixture
 * Provides a way to make API calls with authentication
 */
export const testWithAPI = test.extend<APIClientFixture>({
  apiClient: async ({ context }, use) => {
    const client = {
      async get(url: string, headers?: Record<string, string>) {
        const response = await context.request.get(url, { headers });
        return response.json();
      },
      async post(url: string, data?: any, headers?: Record<string, string>) {
        const response = await context.request.post(url, { data, headers });
        return response.json();
      },
      async put(url: string, data?: any, headers?: Record<string, string>) {
        const response = await context.request.put(url, { data, headers });
        return response.json();
      },
      async delete(url: string, headers?: Record<string, string>) {
        const response = await context.request.delete(url, { headers });
        return response;
      },
    };

    await use(client);
  },
});

/**
 * Authentication fixture interface
 */
interface AuthFixture extends TestFixtures {
  authenticate: {
    loginWith(email: string, password: string): Promise<void>;
    logout(): Promise<void>;
    getAuthToken(): Promise<string>;
  };
}

/**
 * Example: Authentication fixture
 * Handles login and session management
 */
export const testWithAuth = test.extend<AuthFixture>({
  authenticate: async ({ page }, use) => {
    const auth = {
      async loginWith(email: string, password: string) {
        console.log(`[Auth] Logging in with email: ${email}`);
        await page.goto('/login');
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
        console.log(`[Auth] Logged in successfully`);
      },
      async logout() {
        console.log(`[Auth] Logging out`);
        await page.click('[data-testid="logout-button"]');
        await page.waitForURL('**/login');
        console.log(`[Auth] Logged out successfully`);
      },
      async getAuthToken(): Promise<string> {
        const token = await page.context().request.get('/api/auth/token');
        return token.headers()['authorization'] || '';
      },
    };

    await use(auth);
  },
});

/**
 * Database fixture interface
 */
interface DBFixture extends TestFixtures {
  db: {
    query(sql: string): Promise<any[]>;
    seedData(table: string, data: any[]): Promise<void>;
    clearTable(table: string): Promise<void>;
    closeConnection(): Promise<void>;
  };
}

/**
 * Example: Database fixture
 * Provides database access for setup/teardown
 */
export const testWithDB = test.extend<DBFixture>({
  db: async ({}, use) => {
    // Initialize database connection
    console.log('[DB] Connecting to database...');
    
    const db = {
      async query(sql: string) {
        console.log(`[DB] Executing: ${sql}`);
        // Replace with actual DB library
        return [];
      },
      async seedData(table: string, data: any[]) {
        console.log(`[DB] Seeding ${data.length} rows into ${table}`);
        // Seed data
      },
      async clearTable(table: string) {
        console.log(`[DB] Clearing table: ${table}`);
        // Clear table
      },
      async closeConnection() {
        console.log('[DB] Closing connection');
        // Close connection
      },
    };

    await use(db);

    // Cleanup
    await db.closeConnection();
  },
});

/**
 * Data factory fixture interface
 */
interface DataFactoryFixture extends TestFixtures {
  dataFactory: {
    createUser(overrides?: Partial<any>): any;
    createProduct(overrides?: Partial<any>): any;
    createOrder(overrides?: Partial<any>): any;
  };
}

/**
 * Example: Test data fixture
 * Provides factory methods for creating test data
 */
export const testWithData = test.extend<DataFactoryFixture>({
  dataFactory: async ({}, use) => {
    const factory = {
      createUser(overrides?: Partial<any>) {
        return {
          id: Math.random(),
          email: `user${Math.random()}@example.com`,
          firstName: 'Test',
          lastName: 'User',
          ...overrides,
        };
      },
      createProduct(overrides?: Partial<any>) {
        return {
          id: Math.random(),
          name: 'Test Product',
          price: 99.99,
          description: 'A test product',
          ...overrides,
        };
      },
      createOrder(overrides?: Partial<any>) {
        return {
          id: Math.random(),
          userId: Math.random(),
          items: [],
          total: 0,
          status: 'pending',
          ...overrides,
        };
      },
    };

    await use(factory);
  },
});

/**
 * Complete fixture interface
 */
interface CompleteFixture extends TestFixtures {
  apiClient: {
    get(url: string, headers?: Record<string, string>): Promise<any>;
    post(url: string, data?: any, headers?: Record<string, string>): Promise<any>;
  };
  authenticate: {
    login(email: string, password: string): Promise<void>;
  };
  dataFactory: {
    createUser(overrides?: any): any;
  };
}

/**
 * Combine multiple fixtures
 * Create a comprehensive test fixture with all features
 */
export const testComplete = test.extend<CompleteFixture>({
  apiClient: async ({ context }, use) => {
    const client = {
      async get(url: string, headers?: Record<string, string>) {
        const response = await context.request.get(url, { headers });
        return response.json();
      },
      async post(url: string, data?: any, headers?: Record<string, string>) {
        const response = await context.request.post(url, { data, headers });
        return response.json();
      },
    };
    await use(client);
  },

  authenticate: async ({ page }, use) => {
    const auth = {
      async login(email: string, password: string) {
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
      },
    };
    await use(auth);
  },

  dataFactory: async ({}, use) => {
    const factory = {
      createUser: (overrides?: any) => ({
        email: `user${Math.random()}@example.com`,
        ...overrides,
      }),
    };
    await use(factory);
  },
});

/**
 * Example usage:
 * 
 * import { testWithAPI, testWithAuth, testComplete } from '../hooks/extended-fixtures';
 * 
 * testWithAPI('api test', async ({ page, apiClient }) => {
 *   const data = await apiClient.get('https://api.example.com/data');
 *   expect(data).toBeDefined();
 * });
 * 
 * testWithAuth('auth test', async ({ page, authenticate }) => {
 *   await authenticate.loginWith('user@example.com', 'password');
 *   // test code
 * });
 * 
 * testComplete('complete test', async ({ page, apiClient, authenticate, dataFactory }) => {
 *   const user = dataFactory.createUser();
 *   await authenticate.login(user.email, 'password');
 *   // test code
 * });
 */
