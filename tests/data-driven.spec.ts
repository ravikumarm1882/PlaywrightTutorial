import { test, expect } from '../hooks/fixtures';
import { readSheetAsObjects } from '../hooks/excel-utils';

/**
 * Data-driven tests sourced from test_data/test-data.xlsx.
 *
 * exceljs reads asynchronously, so data is loaded inside hooks/tests (not at the
 * synchronous `describe` collection step) and then iterated.
 */
const TEST_DATA_FILE = 'test-data.xlsx';

interface LoginRow {
  username: string;
  password: string;
  expectedResult: string;
}

interface SearchRow {
  searchTerm: string;
  expectedResult: string;
}

test.describe('Data-driven: LoginData sheet', () => {
  let loginRows: LoginRow[] = [];

  test.beforeAll(async () => {
    loginRows = (await readSheetAsObjects(TEST_DATA_FILE, 'LoginData')) as unknown as LoginRow[];
    expect(loginRows.length).toBeGreaterThan(0);
  });

  test('every login row drives a flow', async ({ homePage }) => {
    await homePage.open();

    for (const row of loginRows) {
      console.log(`[Data] login=${row.username} expected=${row.expectedResult}`);

      // Validate the row, then plug it into a flow. Here we only assert the
      // data shape; in a real suite you would drive a login page object, e.g.:
      //
      //   const loginPage = new LoginPage(homePage.page);
      //   await loginPage.open();
      //   await loginPage.login(row.username, row.password);
      //   row.expectedResult === 'success'
      //     ? await loginPage.expectLoggedIn()
      //     : await loginPage.expectError();
      expect(row.username, 'username should be present').toBeTruthy();
      expect(row.password, 'password should be present').toBeTruthy();
      expect(['success', 'failure']).toContain(row.expectedResult);
    }
  });
});

test.describe('Data-driven: SearchData sheet', () => {
  test('search rows load from a second sheet', async () => {
    const searchRows = (await readSheetAsObjects(
      TEST_DATA_FILE,
      'SearchData',
    )) as unknown as SearchRow[];

    expect(searchRows.length).toBeGreaterThan(0);
    for (const row of searchRows) {
      expect(row.searchTerm).toBeTruthy();
      expect(row.expectedResult).toBeTruthy();
    }
  });
});
