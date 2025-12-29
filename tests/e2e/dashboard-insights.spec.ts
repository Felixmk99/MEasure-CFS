
import { test, expect } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL || 'test@example.com';
const PASSWORD = process.env.E2E_PASSWORD || 'password123';

test('Dashboard Insights Flow', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 2. Verify Dashboard Load
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Your Energy Envelope')).toBeVisible();

    // 3. Verify Filters
    // Check if 7 Days filter is active or clickable
    const filter7d = page.getByText('7 Days');
    await expect(filter7d).toBeVisible();
    await filter7d.click();

    // 4. Verify Composite Score
    await expect(page.getByText('Composite Score')).toBeVisible();

    // 5. Check Main Graph presence
    // Recharts are SVGs usually. Hard to test contents, but can check container.
    await expect(page.locator('.recharts-surface').first()).toBeVisible();
});
