import { describe, expect, it } from 'vitest'
import {
  clampLoanParameters,
  maximumInterestOnlyTermsFor,
} from './constraints'
import { compareRepaymentPlans } from './calculations'
import type { LoanParameters } from './types'

const parameters: LoanParameters = {
  principal: 3000000,
  annualInterestRatePercent: 5,
  interestRateAfterInterestOnlyPeriodPercent: 5,
  numberOfTerms: 360,
  numberOfInterestOnlyTerms: 60,
}

describe('clampLoanParameters', () => {
  it('leaves valid parameters alone', () => {
    expect(clampLoanParameters(parameters)).toEqual(parameters)
  })

  it('always leaves at least one term with repayment', () => {
    const clamped = clampLoanParameters({
      ...parameters,
      numberOfInterestOnlyTerms: 360,
    })

    expect(clamped.numberOfInterestOnlyTerms).toBe(359)
    expect(clamped.numberOfTerms - clamped.numberOfInterestOnlyTerms).toBe(1)
  })

  it('allows a loan as short as a single term', () => {
    expect(
      clampLoanParameters({ ...parameters, numberOfTerms: 1 }).numberOfTerms,
    ).toBe(1)
  })

  it('refuses a loan with no terms at all', () => {
    expect(
      clampLoanParameters({ ...parameters, numberOfTerms: 0 }).numberOfTerms,
    ).toBe(1)
  })

  it('allows no interest only period on the shortest loan', () => {
    expect(maximumInterestOnlyTermsFor(1)).toBe(0)
  })

  it('rejects negative input', () => {
    const clamped = clampLoanParameters({
      principal: -1,
      annualInterestRatePercent: -5,
      interestRateAfterInterestOnlyPeriodPercent: -5,
      numberOfTerms: 360,
      numberOfInterestOnlyTerms: -12,
    })

    expect(clamped.principal).toBe(0)
    expect(clamped.annualInterestRatePercent).toBe(0)
    expect(clamped.numberOfInterestOnlyTerms).toBe(0)
  })
})

describe('the degenerate case the clamp exists to prevent', () => {
  it('keeps the extra cost positive once clamped', () => {
    const comparison = compareRepaymentPlans(
      clampLoanParameters({ ...parameters, numberOfInterestOnlyTerms: 360 }),
    )

    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeGreaterThan(0)
  })

  it('still repays the whole loan once clamped', () => {
    const comparison = compareRepaymentPlans(
      clampLoanParameters({ ...parameters, numberOfInterestOnlyTerms: 360 }),
    )
    const terms = comparison.planWithInterestOnlyPeriod.terms

    expect(terms[terms.length - 1].remainingDebt).toBeCloseTo(0, 6)
  })
})
