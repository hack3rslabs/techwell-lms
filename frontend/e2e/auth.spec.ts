import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test('should load login page successfully', async ({ page }) => {
    await page.goto('/login');
    // Ensure the login form renders
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByRole('button', { name: /Login|Sign In/i })).toBeVisible();
  });

  test('should display validation errors for empty credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Login|Sign In/i }).click();
    // Assuming you have client-side validation that prevents submit
    // Wait for validation feedback
    const pageContent = await page.content();
    expect(pageContent).toMatch(/required|invalid|please enter/i);
  });
});
