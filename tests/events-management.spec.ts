import { test, expect } from '@playwright/test';

test.describe('Events Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    // Login
    await page.getByLabel('Work Email').fill('admin@techwell.co.in');
    await page.getByLabel('Password').fill('Password@123');
    await page.getByRole('button', { name: 'Login' }).click();
    // Wait for successful login (navigates to dashboard typically)
    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Navigate to events page
    await page.goto('http://localhost:3000/admin/events');
    // Wait for the page to load
    await expect(page.getByRole('heading', { name: 'Events Management' })).toBeVisible();
  });

  test('Create, Edit, and Delete an Event', async ({ page }) => {
    const eventTitle = `Automated Test Event ${Date.now()}`;
    const updatedTitle = `${eventTitle} - Updated`;

    // 1. Create Event
    await page.getByRole('button', { name: 'Create Event' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Event Title').fill(eventTitle);
    await page.getByLabel('Event Description').fill('This is a test event created by Playwright.');
    
    // Select Event Type
    await page.getByRole('combobox').nth(0).click();
    await page.getByRole('option', { name: 'Webinar' }).click();

    // Select Status
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Upcoming (Approved)' }).click();

    await page.getByLabel('Date').fill('2026-12-31');
    await page.getByLabel('Time').fill('10:00 AM');
    await page.getByLabel('Location / Meeting Link').fill('https://zoom.us/test');
    await page.getByLabel('Total Seats').fill('50');

    await page.getByRole('button', { name: 'Save Event' }).click();

    // Verify it appears in the table
    await expect(page.getByText(eventTitle)).toBeVisible({ timeout: 10000 });

    // 2. Edit Event
    // Find the row containing our event and click the edit button
    const row = page.getByRole('row', { name: eventTitle }).first();
    await row.locator('button').filter({ hasText: '' }).nth(2).click(); // Edit is the 3rd icon button (Issue, QR, Edit, Trash) - wait, if Issue is absent, it's 2nd. Let's rely on lucide-react Edit or just finding button by index.
    // Actually, we can click the button next to the QR button. Since Playwright doesn't know icons easily, let's just click the button inside the row that is used for editing.
    // Let's use bounding box or just click the Edit button using a better selector if possible.
    // In our UI, there are up to 4 buttons. Issue (optional), QR, Edit, Trash. 
    // Let's just click the 2nd to last button in the row for Edit.
    const buttons = row.locator('button');
    const count = await buttons.count();
    await buttons.nth(count - 2).click(); // Edit button

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Event Title').fill(updatedTitle);
    await page.getByRole('button', { name: 'Update Event' }).click();

    await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 10000 });

    // 3. Delete Event
    const updatedRow = page.getByRole('row', { name: updatedTitle }).first();
    const updatedButtons = updatedRow.locator('button');
    const updatedCount = await updatedButtons.count();
    
    // Accept the confirmation dialog
    page.once('dialog', dialog => dialog.accept());
    await updatedButtons.nth(updatedCount - 1).click(); // Trash button

    // Verify deletion
    await expect(page.getByText(updatedTitle)).not.toBeVisible();
  });
});
