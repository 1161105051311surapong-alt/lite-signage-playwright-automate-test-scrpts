
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear All' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear All' }).click();
  await expect(page.locator('body')).toContainText('Playlist cleared.');
  await expect(page.locator('h4')).toContainText('Playlist is Empty');
});