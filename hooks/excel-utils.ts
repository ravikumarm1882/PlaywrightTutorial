import path from 'path';
import ExcelJS from 'exceljs';
import { TEST_DATA_DIR, VERBOSE_LOGS } from './env';

function log(message: string) {
  if (VERBOSE_LOGS) {
    log(message);
  }
}

/**
 * Excel utilities - read data from .xlsx workbooks for data-driven tests.
 *
 * Built on `exceljs`. All readers are async (exceljs loads workbooks async).
 * Pass either a bare file name (resolved against TEST_DATA_DIR) or an absolute path.
 */

/**
 * Resolve a workbook path. Bare names resolve against the project's TEST_DATA_DIR;
 * absolute paths are returned unchanged.
 */
export function resolveDataPath(fileName: string): string {
  if (path.isAbsolute(fileName)) {
    return fileName;
  }
  return path.resolve(process.cwd(), TEST_DATA_DIR, fileName);
}

/**
 * Flatten an exceljs cell value into a plain JS value.
 * Handles rich text, formula results, hyperlinks, and dates.
 */
function normalizeCellValue(value: ExcelJS.CellValue): unknown {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object') {
    const obj = value as unknown as Record<string, unknown>;
    // Formula cell: { formula, result }
    if ('result' in obj) {
      return obj.result ?? '';
    }
    // Hyperlink cell: { text, hyperlink }
    if ('text' in obj) {
      return obj.text ?? '';
    }
    // Rich text cell: { richText: [{ text }, ...] }
    if ('richText' in obj && Array.isArray(obj.richText)) {
      return (obj.richText as Array<{ text?: string }>).map((part) => part.text ?? '').join('');
    }
    // Shared/inline string or error: fall back to a string form.
    return String((obj as { text?: unknown }).text ?? '');
  }

  return value;
}

/**
 * Load a workbook from disk (internal helper).
 */
async function loadWorkbook(fileName: string): Promise<ExcelJS.Workbook> {
  const filePath = resolveDataPath(fileName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  return workbook;
}

/**
 * Get a worksheet by name, throwing a clear error if it is missing.
 */
function requireSheet(workbook: ExcelJS.Workbook, sheetName: string): ExcelJS.Worksheet {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    const available = workbook.worksheets.map((ws) => ws.name).join(', ');
    throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${available}`);
  }
  return sheet;
}

/**
 * List the sheet names in a workbook.
 */
export async function getSheetNames(fileName: string): Promise<string[]> {
  log(`[Excel] Reading sheet names from ${fileName}`);
  const workbook = await loadWorkbook(fileName);
  return workbook.worksheets.map((ws) => ws.name);
}

/**
 * Read a sheet as a 2D array of normalized values (header row included).
 */
export async function readSheetAsRows(fileName: string, sheetName: string): Promise<unknown[][]> {
  log(`[Excel] Reading rows from ${fileName} -> ${sheetName}`);
  const workbook = await loadWorkbook(fileName);
  const sheet = requireSheet(workbook, sheetName);

  const rows: unknown[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    // row.values is 1-indexed (index 0 is undefined); slice it off.
    const values = (row.values as ExcelJS.CellValue[]).slice(1);
    rows.push(values.map(normalizeCellValue));
  });

  log(`[Excel] Read ${rows.length} row(s)`);
  return rows;
}

/**
 * Read a sheet as an array of objects, using the first row as headers.
 * This is the primary API for data-driven tests.
 *
 * @example
 *   const rows = await readSheetAsObjects('test-data.xlsx', 'LoginData');
 *   // [{ username: 'standard_user', password: 'secret_sauce', expectedResult: 'success' }, ...]
 */
export async function readSheetAsObjects(
  fileName: string,
  sheetName: string,
): Promise<Record<string, unknown>[]> {
  const rows = await readSheetAsRows(fileName, sheetName);
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => String(header).trim());
  const dataRows = rows.slice(1);

  const objects = dataRows.map((row) => {
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      if (header) {
        record[header] = row[index] ?? '';
      }
    });
    return record;
  });

  log(`[Excel] Mapped ${objects.length} object(s) using headers: ${headers.join(', ')}`);
  return objects;
}

/**
 * Read a single cell value by its address (e.g. "B2").
 */
export async function getCellValue(
  fileName: string,
  sheetName: string,
  cellAddress: string,
): Promise<unknown> {
  log(`[Excel] Reading cell ${sheetName}!${cellAddress} from ${fileName}`);
  const workbook = await loadWorkbook(fileName);
  const sheet = requireSheet(workbook, sheetName);
  return normalizeCellValue(sheet.getCell(cellAddress).value);
}
