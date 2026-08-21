import { test, expect } from '@playwright/test';

test.describe('Admin Panel E2E', () => {
  // We'll test access control - unauthorized users should be redirected to login
  test('should block unauthorized access to admin dashboard', async ({ page }) => {
    const response = await page.goto('/admin/dashboard');
    // It should either return 401/403 or redirect to /login
    expect(page.url()).toContain('/login');
  });

  test('should block unauthorized access to SEO manager', async ({ page }) => {
    const response = await page.goto('/admin/seo');
    expect(page.url()).toContain('/login');
  });
});
