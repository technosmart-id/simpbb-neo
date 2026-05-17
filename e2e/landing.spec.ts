import { test, expect } from '@playwright/test'

// T1 — tracer bullet: public landing page renders correctly
// No auth needed — confirms basic Playwright setup works against the dev server.
test('landing page shows SIMPBB branding and login CTA', async ({ page }) => {
  // Override storage state — landing page must be accessible without auth
  await page.context().clearCookies()
  await page.goto('/')

  await expect(page.locator('h1')).toContainText('SIM')
  await expect(page.getByRole('link', { name: /masuk sistem/i })).toBeVisible()
})
