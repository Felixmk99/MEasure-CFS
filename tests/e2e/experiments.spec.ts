
import { test, expect } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL || 'test@example.com';
const PASSWORD = process.env.E2E_PASSWORD || 'password123';

test('Experiments Engine Flow', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/dashboard');

    // 2. Navigate to Experiments
    await page.goto('/experiments');

    // 3. Open Dialog
    const startBtn = page.getByRole('button', { name: 'Start New Experiment' });
    // In German it might be specific, but 'initialExperiments' uses keys. 
    // The button has a plus icon. Check by role or text.
    // It seems the translation key is 'experiments.actions.start_new'
    await startBtn.click();

    // 4. Fill Form
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Experiment Name').fill('E2E Test Experiment');
    await page.getByLabel('Dosage').fill('100mg');
    // Category defaults to Lifestyle

    // 5. Save
    await page.getByRole('button', { name: 'Start Experiment' }).click();

    // 6. Verify in List
    await expect(page.getByText('E2E Test Experiment')).toBeVisible();

    // 7. Cleanup (Delete)
    // Find the delete button for this new item.
    // Complex selector: Find card containing text "E2E Test Experiment", then find trash icon.
    // We can filter by text.
    const card = page.locator('.group', { hasText: 'E2E Test Experiment' });

    // Hover to reveal actions
    await card.hover();

    // Handle window.confirm dialog
    page.on('dialog', dialog => dialog.accept());

    // Click delete (Trash icon)
    await card.locator('button').nth(1).click(); // 2nd button is Trash usually (1st is Edit)

    // Verify removal
    await expect(page.getByText('E2E Test Experiment')).not.toBeVisible();
});
