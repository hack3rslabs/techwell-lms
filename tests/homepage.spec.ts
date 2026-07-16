import { test, expect } from '@playwright/test';

test('has title and login link', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Techwell/);

  // create a locator
  const loginLink = page.getByRole('link', { name: 'Login' });

  // Expect an attribute "to be strictly equal" to the value.
  await expect(loginLink).toBeVisible();
});
