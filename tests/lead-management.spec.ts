import { test, expect } from '@playwright/test';

test.describe('Lead Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    // Login
    await page.getByLabel('Work Email').fill('admin@techwell.co.in');
    await page.getByLabel('Password').fill('Password@123');
    await page.getByRole('button', { name: 'Login' }).click();
    // Wait for successful login (navigates to dashboard typically)
    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Navigate to leads page
    await page.goto('http://localhost:3000/admin/leads');
    await expect(page.getByRole('heading', { name: 'Lead Management' })).toBeVisible();
  });

  test('Generate, Source, Land Lead, and Follow Up', async ({ page }) => {
    const leadName = `Test Lead ${Date.now()}`;
    const leadEmail = `testlead${Date.now()}@example.com`;

    // 1. Lead Generation (Add Lead)
    await page.getByRole('button', { name: 'Add Lead' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Full Name').fill(leadName);
    await page.getByLabel('Email').fill(leadEmail);
    await page.getByLabel('Phone').fill('+919876543210');
    
    // Select Source (e.g., Website)
    // There are many selects on the form, so we can interact by role or label.
    // However, Shadcn UI Select component replaces native select and label clicking might not work directly. 
    // Let's use getByText or click near the label. 
    // Since Shadcn Select uses `role="combobox"`, we can find them by index if label doesn't link perfectly.
    // From page.tsx: 0: Source, 1: Status, 2: Assigned Staff, 3: Franchise.
    
    const comboboxes = page.getByRole('combobox');
    await comboboxes.nth(0).click(); // Source
    await page.getByRole('option', { name: 'Website' }).click();

    await comboboxes.nth(1).click(); // Status
    await page.getByRole('option', { name: 'New' }).click();

    await page.getByLabel('College/University').fill('Test University');
    
    await page.getByRole('button', { name: 'Save Lead' }).click();

    // Verify lead appears in the table by searching for it
    const searchInput = page.getByPlaceholder('Search leads...');
    await searchInput.fill(leadName);
    
    await expect(page.getByText(leadName)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(leadEmail)).toBeVisible();

    // 2. Follow up (Update Lead Status to FOLLOW_UP or INTERESTED)
    const row = page.getByRole('row', { name: leadName }).first();
    
    // In Leads table, the edit button is not directly named, it's an icon. It's the 2nd button in the actions cell.
    // The actions column has: History (Eye), Edit (Edit2), Delete (Trash2), and maybe Mail or Convert.
    // Let's rely on checking the DOM or clicking the Edit button by looking for its SVG/lucide icon, 
    // or just using nth if we know it.
    // The easiest way is to use page.getByRole('button').filter({ hasText: '' }).nth(...) or just wait for it.
    // Wait, the Edit button has the Edit icon. 
    // Let's use `getByTitle('Edit Lead')` or similar if title exists. (It doesn't seem to have a title in page.tsx).
    // Let's click the button that appears before Trash.
    const buttons = row.locator('button');
    const count = await buttons.count();
    // In leads page actions: Edit, Delete, maybe others. Let's just click the Edit button which is usually second to last or so.
    // We can just iterate or use index. Looking at page.tsx, Actions include:
    // Email, History, Edit, Delete. Edit is 2nd from last.
    await buttons.nth(count - 2).click(); 

    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Change status to Interested (Since Follow Up isn't in the create/edit form enum directly in the form! 
    // Wait, in `page.tsx` the form has: New, Contacted, Interested, Qualified, Lost.
    // Let's change it to 'Contacted')
    const formComboboxes = page.getByRole('combobox');
    await formComboboxes.nth(1).click(); // Status
    await page.getByRole('option', { name: 'Contacted' }).click();
    
    await page.getByRole('button', { name: 'Update Lead' }).click();

    // 3. Validate Status change in table
    // Ensure the badge shows 'CONTACTED'
    await expect(row.getByText('CONTACTED')).toBeVisible({ timeout: 10000 });

    // Clean up
    page.once('dialog', dialog => dialog.accept());
    await buttons.nth(count - 1).click(); // Trash button
    await expect(page.getByText(leadName)).not.toBeVisible();
  });
});
