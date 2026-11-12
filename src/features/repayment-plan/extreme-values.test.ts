import { describe, expect, it } from 'vitest'
import { compareRepaymentPlans } from './calculations'
import { clampLoanParameters } from './constraints'
import type { LoanParameters } from './types'

function planFor(overrides: Partial<LoanParameters>) {
  return compareRepaymentPlans(
    clampLoanParameters({
      principal: 3000000,
      annualInterestRatePercent: 5,
      interestRateAfterInterestOnlyPeriodPercent: 5,
      numberOfTerms: 360,
      numberOfInterestOnlyTerms: 60,
      ...overrides,
    }),
  )
}

function everyNumberIsFinite(comparison: ReturnType<typeof planFor>): boolean {
  return [
    comparison.paymentWithoutInterestOnlyPeriod,
    comparison.paymentDuringInterestOnlyPeriod,
    comparison.paymentAfterInterestOnlyPeriod,
    comparison.paymentAfterRateChangeWithoutInterestOnlyPeriod,
    comparison.additionalCostOfInterestOnlyPeriod,
    comparison.planWithoutInterestOnlyPeriod.totalCost,
    comparison.planWithInterestOnlyPeriod.totalCost,
  ].every((value) => Number.isFinite(value))
}

describe('ekstreme lanebelop', () => {
  it('handterer en krone', () => {
    const comparison = planFor({ principal: 1 })

    expect(everyNumberIsFinite(comparison)).toBe(true)
    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeGreaterThan(0)
  })

  it('handterer en milliard', () => {
    const comparison = planFor({ principal: 1000000000 })

    expect(everyNumberIsFinite(comparison)).toBe(true)
    expect(
      comparison.planWithInterestOnlyPeriod.terms.at(-1)?.remainingDebt ?? 1,
    ).toBeCloseTo(0, 4)
  })

  it('gir ingen kostnad uten lan', () => {
    const comparison = planFor({ principal: 0 })

    expect(comparison.planWithoutInterestOnlyPeriod.totalCost).toBe(0)
    expect(comparison.additionalCostOfInterestOnlyPeriod).toBe(0)
  })
})

describe('ekstreme renter', () => {
  it('handterer nullrente i begge periodene', () => {
    const comparison = planFor({
      annualInterestRatePercent: 0,
      interestRateAfterInterestOnlyPeriodPercent: 0,
    })

    expect(comparison.planWithoutInterestOnlyPeriod.totalCost).toBeCloseTo(
      3000000,
      6,
    )
    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeCloseTo(0, 6)
  })

  it('handterer hundre prosent rente', () => {
    const comparison = planFor({
      annualInterestRatePercent: 100,
      interestRateAfterInterestOnlyPeriodPercent: 100,
    })

    expect(everyNumberIsFinite(comparison)).toBe(true)
    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeGreaterThan(0)
  })

  /**
   * Over omtrent 100 prosent arlig rente blir (1+r)^-n mindre enn
   * maskinepsilon. Nevneren i annuitetsformelen avrundes til 1, terminbelopet
   * blir eksakt lik renten, og avdraget blir null. Lanet slutter a amortisere.
   * Dette er en grense i flyttall, ikke i utregningen, og testen later som om
   * den ikke finnes.
   */
  it('degraderer forutsigbart ved absurd hoy rente', () => {
    const comparison = planFor({
      annualInterestRatePercent: 1000,
      interestRateAfterInterestOnlyPeriodPercent: 1000,
    })
    const firstTerm = comparison.planWithoutInterestOnlyPeriod.terms[0]

    expect(everyNumberIsFinite(comparison)).toBe(true)
    expect(firstTerm.payment).toBeCloseTo(firstTerm.interest, 6)
    expect(firstTerm.principalRepayment).toBe(0)
  })

  it('nedbetaler fortsatt lanet ved hundre prosent rente', () => {
    const comparison = planFor({
      annualInterestRatePercent: 100,
      interestRateAfterInterestOnlyPeriodPercent: 100,
    })
    const terms = comparison.planWithInterestOnlyPeriod.terms

    expect(terms[terms.length - 1].remainingDebt / 3000000).toBeCloseTo(0, 5)
  })

  it('handterer et kraftig rentefall', () => {
    const comparison = planFor({
      annualInterestRatePercent: 15,
      interestRateAfterInterestOnlyPeriodPercent: 0,
    })

    expect(everyNumberIsFinite(comparison)).toBe(true)
    expect(
      comparison.planWithoutInterestOnlyPeriod.terms.at(-1)?.remainingDebt ?? 1,
    ).toBeCloseTo(0, 4)
  })
})

describe('ekstreme lopetider', () => {
  it('handterer et lan pa en enkelt termin', () => {
    const comparison = planFor({
      numberOfTerms: 1,
      numberOfInterestOnlyTerms: 0,
    })

    expect(comparison.planWithoutInterestOnlyPeriod.terms).toHaveLength(1)
    expect(
      comparison.planWithoutInterestOnlyPeriod.terms.at(-1)?.remainingDebt ?? 1,
    ).toBeCloseTo(0, 6)
  })

  it('handterer hundre ars lopetid', () => {
    const comparison = planFor({ numberOfTerms: 1200 })

    expect(comparison.planWithInterestOnlyPeriod.terms).toHaveLength(1200)
    expect(everyNumberIsFinite(comparison)).toBe(true)
  })

  it('nedbetaler hele lanet i siste termin nar avdragsfriheten er maksimal', () => {
    const comparison = planFor({
      numberOfTerms: 360,
      numberOfInterestOnlyTerms: 360,
    })
    const lastTerm = comparison.planWithInterestOnlyPeriod.terms.at(-1)

    expect(comparison.numberOfTermsWithRepayment).toBe(1)
    expect(lastTerm?.remainingDebt ?? 1).toBeCloseTo(0, 4)
    expect(lastTerm?.principalRepayment ?? 0).toBeCloseTo(3000000, 4)
    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeGreaterThan(0)
  })
})
