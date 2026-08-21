import { test, expect } from '@playwright/test';

test.describe('SEO Pages E2E', () => {
  test('should load dynamic SEO pages with correct status', async ({ page }) => {
    const response = await page.goto('/python-training');
    expect(response?.status()).toBe(200);
    
    // Check if Canonical Tag is correctly injecting techwell.co.in
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('techwell.co.in');

    // Check if Page Title has 'Training | Techwell'
    await expect(page).toHaveTitle(/Training \| Techwell/i);
  });
  
  test('should fallback to 404 for unknown dynamic slugs', async ({ page }) => {
    const response = await page.goto('/unknown-random-slug-1234');
    
    // Next.js dev server sometimes returns 200 for notFound(), so we also check the UI
    const is404Status = response?.status() === 404;
    const isCustom404UI = await page.getByText('Page Not Found').isVisible();
    const isDefault404UI = await page.getByText('could not be found').isVisible();
    
    expect(is404Status || isCustom404UI || isDefault404UI).toBeTruthy();
  });
});
