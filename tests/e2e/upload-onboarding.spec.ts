
import { test, expect } from '@playwright/test';
import path from 'path';

test('Upload-First Onboarding Flow', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');

    // 2. Upload File
    // Note: We need to locate the input[type=file] which might be hidden by Dropzone
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/sample_data.csv'));

    // 3. Verify Redirect to Signup
    // The logic is: setPendingUpload -> checkSession -> redirect /signup
    await expect(page).toHaveURL(/\/signup/);

    // 4. Verify Context on Signup Page
    // Check that the user is welcomed or sees the "Clarify journey" text
    await expect(page.getByText('Start your')).toBeVisible();
    await expect(page.getByText('clarity journey')).toBeVisible();

    // 5. Verify local storage or visual indication?
    // Since pendingUpload is in React Context (memory), it's hard to check directly without React DevTools.
    // But the redirection proves the logic triggered.
});
