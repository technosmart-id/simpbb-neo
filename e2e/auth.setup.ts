import { test as setup } from '@playwright/test'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUTH_FILE = path.join(__dirname, '.auth/user.json')

// Read from env — must match what lib/db/seed/dev.ts used to seed the DB
const EMAIL = process.env.TEST_EMAIL ?? process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@example.com'
const PASSWORD = process.env.TEST_PASSWORD ?? process.env.DEFAULT_ADMIN_PASSWORD ?? 'admin123456'

setup('authenticate', async ({ page }) => {
  await page.goto('/sign-in')

  // Fill identifier (email detected → password sign-in path)
  await page.locator('#identifier').fill(EMAIL)
  await page.locator('#password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  // Better Auth redirects to /dashboard on success
  await page.waitForURL('**/dashboard', { timeout: 20_000 })

  await page.context().storageState({ path: AUTH_FILE })
})
