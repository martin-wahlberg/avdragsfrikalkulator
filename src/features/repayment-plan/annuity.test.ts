import { describe, expect, it } from 'vitest'
import {
  calculateMonthlyInterestRate,
  calculatePayment,
} from './annuity'

describe('calculateMonthlyInterestRate', () => {
  it('divides the nominal rate by twelve, the way the spreadsheet does', () => {
    expect(calculateMonthlyInterestRate(5.2)).toBeCloseTo(5.2 / 100 / 12, 12)
  })
})

describe('calculatePayment', () => {
  it('matches the spreadsheet payment for the source loan', () => {
    expect(
      calculatePayment(calculateMonthlyInterestRate(5.2), 360, 676721),
    ).toBeCloseTo(3715.948645, 5)
  })

  it('spreads the principal evenly when the loan is interest free', () => {
    expect(calculatePayment(0, 12, 120000)).toBeCloseTo(10000, 6)
  })

  it('returns nothing to pay when there are no terms left', () => {
    expect(calculatePayment(0.004, 0, 500000)).toBe(0)
  })
})
