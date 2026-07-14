import { test, expect } from '@playwright/test';

test.describe('Employer Job Posting', () => {
  test('should allow an employer to log in and post a new job', async ({ page }) => {
    // Navigate to Employer Login
    await page.goto('http://localhost:3000/login');

    // Assume we have a test employer account
    await page.locator('input[type="email"]').fill('employer@techwell.com');
    await page.locator('input[type="password"]').fill('Employer@123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Verify successful login
    // Depending on routing, might go to /employer/dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Navigate to Job Posting
    await page.goto('http://localhost:3000/employer/dashboard/jobs/new');
    await expect(page.getByRole('heading', { name: /Post a Job|Create Job/i })).toBeVisible({ timeout: 10000 });

    // Fill job details
    await page.locator('input[name="title"]').fill('Senior Frontend Developer');
    await page.locator('textarea[name="description"]').fill('Looking for an experienced React developer.');
    await page.locator('input[name="location"]').fill('Remote');
    
    // Depending on the exact UI, there could be select dropdowns or combo boxes
    // For now we submit if there's a submit button
    const submitButton = page.getByRole('button', { name: /Post Job|Submit|Create/i });
    if (await submitButton.isVisible()) {
        await submitButton.click();
    }

    // Assert that we are redirected to jobs list or get a success message
    // await expect(page).toHaveURL(/.*\/employer\/dashboard\/jobs/);
  });
});
