/**
 * Denda (late-payment penalty) Calculator.
 *
 * Implements business rule BR-10 from REQUIREMENTS.md:
 *   - 2% per month from jatuh tempo (due date)
 *   - Maximum penalty: 48% (i.e. 24 months)
 *
 * Pure calculation — no DB access.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Penalty rate per month (2%). */
const DENDA_RATE_PER_MONTH = 0.02

/** Maximum number of months that accrue penalty. */
const MAX_DENDA_MONTHS = 24

/** Maximum penalty percentage (24 months × 2% = 48%). */
const MAX_DENDA_PERSEN = MAX_DENDA_MONTHS * DENDA_RATE_PER_MONTH

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DendaResult {
  /** Number of overdue months (0 – 24) */
  months: number
  /** Penalty percentage as a decimal (0 – 0.48) */
  dendaPersen: number
  /** Penalty amount in rupiah */
  dendaAmount: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Count the number of full calendar months between two dates.
 *
 * A partial month is counted as a full month (i.e. even one day past
 * the due date in a new month triggers 1 month of penalty).
 *
 * @param jatuhTempo  - SPPT due date
 * @param paymentDate - Actual payment date
 * @returns Number of months late (≥ 0)
 */
function countOverdueMonths(jatuhTempo: Date, paymentDate: Date): number {
  if (paymentDate <= jatuhTempo) {
    return 0
  }

  const yearDiff = paymentDate.getFullYear() - jatuhTempo.getFullYear()
  const monthDiff = paymentDate.getMonth() - jatuhTempo.getMonth()
  let months = yearDiff * 12 + monthDiff

  // If the payment day is after the due day within the same relative month,
  // the current month is already counted by the month diff.
  // If the payment day is on or before the due day, we still count that
  // month because payment is past the due date (any day in the next month
  // already counts as 1 month late).
  if (months === 0 && paymentDate > jatuhTempo) {
    // Same calendar month but past the due date — counts as 1 month
    months = 1
  } else if (paymentDate.getDate() > jatuhTempo.getDate()) {
    // Crossed into a partial month → round up
    months += 1
  } else if (paymentDate.getDate() <= jatuhTempo.getDate() && months > 0) {
    // Still within the "grace" portion of the month — already counted
    // by the month diff, no adjustment needed.
  }

  return Math.max(months, 0)
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Calculate the late-payment penalty (denda) for PBB.
 *
 * **BR-10:** Denda = 2% per month from jatuh tempo, maximum 48% (24 months).
 *
 * @param pbbAmount   - PBB amount that is owed (PBB_YgHarusDibayar)
 * @param jatuhTempo  - SPPT due date
 * @param paymentDate - Date the payment is being made / calculated
 * @returns Breakdown of penalty calculation
 */
export function calculateDenda(
  pbbAmount: number,
  jatuhTempo: Date,
  paymentDate: Date,
): DendaResult {
  // No penalty if paid on or before due date
  if (paymentDate <= jatuhTempo) {
    return { months: 0, dendaPersen: 0, dendaAmount: 0 }
  }

  const rawMonths = countOverdueMonths(jatuhTempo, paymentDate)
  const months = Math.min(rawMonths, MAX_DENDA_MONTHS)
  const dendaPersen = Math.min(months * DENDA_RATE_PER_MONTH, MAX_DENDA_PERSEN)
  const dendaAmount = Math.round(pbbAmount * dendaPersen)

  return { months, dendaPersen, dendaAmount }
}
