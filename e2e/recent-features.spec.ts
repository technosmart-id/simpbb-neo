import { test, expect } from '@playwright/test'

// All tests in this file run with the authenticated session saved by auth.setup.ts

// T3 — Pembayaran baru: "Cari Objek Pajak" button is visible ─────────────────
test('pembayaran baru shows "Cari Objek Pajak" button in Objek Pajak card', async ({ page }) => {
  await page.goto('/pembayaran/baru')

  // Card section heading
  await expect(page.getByRole('heading', { name: 'Objek Pajak' })).toBeVisible()

  // Search button label — verifies the rename from "Cari NOP" to "Cari Objek Pajak"
  await expect(page.getByRole('button', { name: /cari objek pajak/i })).toBeVisible()
})

// T4 — Pelayanan baru: submit disabled without NOP (non-kolektif) ─────────────
test('pelayanan baru submit is disabled when non-kolektif and no NOP is selected', async ({ page }) => {
  await page.goto('/pelayanan/baru')

  // Fill mandatory fields except NOP
  const noField = page.locator('input[placeholder*="Auto-generate"], input[class*="font-mono"]').first()
  // No Pelayanan is auto-filled from the server — just check it's there
  await expect(noField).not.toBeEmpty()

  // Pick a jenis pelayanan (first available option)
  await page.getByRole('combobox').first().click()
  await page.getByRole('option').first().click()

  // Confirm kolektif toggle is OFF (non-kolektif, default)
  const toggle = page.getByRole('switch', { name: /kolektif/i })
  await expect(toggle).not.toBeChecked()

  // Submit button must remain disabled — NOP not selected
  const submitBtn = page.getByRole('button', { name: /simpan berkas/i })
  await expect(submitBtn).toBeDisabled()
})

// T5 — Pelayanan baru: submit enabled when kolektif toggle is ON ──────────────
test('pelayanan baru submit is enabled when berkas is kolektif (no NOP required)', async ({ page }) => {
  await page.goto('/pelayanan/baru')

  // Pick jenis pelayanan
  await page.getByRole('combobox').first().click()
  await page.getByRole('option').first().click()

  // Turn ON kolektif toggle
  const toggle = page.getByRole('switch', { name: /kolektif/i })
  await toggle.click()
  await expect(toggle).toBeChecked()

  // Submit must now be ENABLED — kolektif berkas doesn't need an NOP
  const submitBtn = page.getByRole('button', { name: /simpan berkas/i })
  await expect(submitBtn).toBeEnabled()
})

// T6 — Verifikasi SPPT page: shows error when params are missing ───────────────
test('verifikasi-sppt page shows parameter error when no NOP or tahun provided', async ({ page }) => {
  await page.goto('/verifikasi-sppt')

  // Should show the invalid-parameter error state — not a data table or verified state
  await expect(page.getByText(/parameter tidak valid/i)).toBeVisible()
  await expect(page.getByText(/kode qr tidak/i)).toBeVisible()
})
