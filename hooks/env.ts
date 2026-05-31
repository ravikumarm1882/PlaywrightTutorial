import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const rawEnv = process.env;

export const BASE_URL = rawEnv.BASE_URL ?? 'https://playwright.dev';
export const BROWSER_TYPE = (rawEnv.BROWSER_TYPE ?? 'chromium') as 'chromium' | 'firefox' | 'webkit';
export const HEADLESS = rawEnv.HEADLESS?.toLowerCase() === 'true';
export const USER_AGENT = rawEnv.USER_AGENT ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
export const VIDEO_DIR = rawEnv.VIDEO_DIR ?? 'test-results/videos';
export const SCREENSHOT_DIR = rawEnv.SCREENSHOT_DIR ?? 'test-results/screenshots';
export const LAUNCH_ARGS = rawEnv.LAUNCH_ARGS?.split(',').map((arg) => arg.trim()).filter(Boolean) ?? ['--disable-blink-features=AutomationControlled'];
