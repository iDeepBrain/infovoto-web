/**
 * Auth protection tests — require Next.js running on localhost:3000.
 *
 * Run: npm run test:e2e
 * Or:  npx playwright test tests/auth.spec.ts
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

test.describe('Auth Protection', () => {
  test('landing page is publicly accessible', async ({ page }) => {
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    // Should render without redirect to login
    expect(page.url()).not.toContain('/login');
  });

  test('/chat redirects to login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'domcontentloaded' });
    // NextAuth middleware redirects unauthenticated users to /login or /api/auth/signin
    await page.waitForURL(/login|signin/, { timeout: 5000 });
    expect(page.url()).toMatch(/login|signin/);
  });

  test('/stats redirects to login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/stats`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/login|signin/, { timeout: 5000 });
    expect(page.url()).toMatch(/login|signin/);
  });

  test('login page shows Google sign-in button', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    // Should have a Google auth button or link
    const googleButton = page.locator('button, a').filter({ hasText: /google|continuar/i });
    await expect(googleButton.first()).toBeVisible({ timeout: 5000 });
  });
});
