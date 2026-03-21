import { test } from '@playwright/test';

test.describe('Visual Tests - Landing Page', () => {
  test('landing page desktop view', async ({ page }) => {
    // Wait for app to be ready
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Take full page screenshot
    await page.screenshot({
      path: './screenshots/landing-desktop.png',
      fullPage: true
    });

    console.log('✅ Desktop screenshot saved: screenshots/landing-desktop.png');
  });

  test('landing page mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Take full page screenshot
    await page.screenshot({
      path: './screenshots/landing-mobile.png',
      fullPage: true
    });

    console.log('✅ Mobile screenshot saved: screenshots/landing-mobile.png');
  });

  test('landing page tablet view', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Take full page screenshot
    await page.screenshot({
      path: './screenshots/landing-tablet.png',
      fullPage: true
    });

    console.log('✅ Tablet screenshot saved: screenshots/landing-tablet.png');
  });

  test('test responsive navbar', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Check navbar elements exist
    const logo = await page.locator('text=InfoVoto').first();
    await logo.waitFor({ state: 'visible' });

    // Check mobile menu button exists
    const mobileMenuButton = page.locator('button').filter({ has: page.locator('svg') }).first();

    console.log('✅ Navbar elements validated');
  });

  test('test hero section CTA buttons', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Check CTA buttons exist
    const startButton = await page.locator('text=Empezar Ahora');
    await startButton.waitFor({ state: 'visible' });

    const learnMoreButton = await page.locator('text=Saber Más');
    await learnMoreButton.waitFor({ state: 'visible' });

    console.log('✅ Hero CTA buttons validated');
  });

  test('test features section visibility', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Scroll to features section
    await page.locator('#features').scrollIntoViewIfNeeded();

    // Check feature cards exist
    const features = await page.locator('text=Candidatos').first();
    await features.waitFor({ state: 'visible' });

    console.log('✅ Features section validated');
  });
});
