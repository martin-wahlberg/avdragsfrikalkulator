import { describe, expect, it } from 'vitest'
import { compareRepaymentPlans } from './calculations'
import { findEquivalentInterestRatePercent } from './equivalent-rate'
import type { LoanParameters } from './types'

const baseParameters: LoanParameters = {
  principal: 3000000,
  annualInterestRatePercent: 5,
  interestRateAfterInterestOnlyPeriodPercent: 5,
  numberOfTerms: 360,
  numberOfInterestOnlyTerms: 60,
}

function equivalentRateFor(overrides: Partial<LoanParameters>): number | null {
  return compareRepaymentPlans({ ...baseParameters, ...overrides })
    .equivalentInterestRatePercent
}

describe('findEquivalentInterestRatePercent', () => {
  it('gir nøyaktig den faktiske renta når det ikke er avdragsfrihet', () => {
    const rate = equivalentRateFor({ numberOfInterestOnlyTerms: 0 })

    expect(rate).not.toBeNull()
    expect(rate ?? 0).toBeCloseTo(5, 6)
  })

  it('gir en høyere rente når avdragsfrihet koster penger', () => {
    expect(equivalentRateFor({}) ?? 0).toBeCloseTo(5.32, 2)
  })

  it('stiger når den avdragsfrie perioden blir lengre', () => {
    const fiveYears = equivalentRateFor({ numberOfInterestOnlyTerms: 60 }) ?? 0
    const tenYears = equivalentRateFor({ numberOfInterestOnlyTerms: 120 }) ?? 0

    expect(tenYears).toBeGreaterThan(fiveYears)
    expect(tenYears).toBeCloseTo(5.68, 2)
  })

  it('havner under faktisk rente når renta faller underveis', () => {
    const rate =
      equivalentRateFor({ interestRateAfterInterestOnlyPeriodPercent: 3 }) ?? 0

    expect(rate).toBeLessThan(5)
    expect(rate).toBeCloseTo(3.78, 2)
  })

  it('treffer den samlede rentekostnaden den løser for', () => {
    const comparison = compareRepaymentPlans(baseParameters)
    const rate = comparison.equivalentInterestRatePercent

    expect(rate).not.toBeNull()

    const plainLoanAtThatRate = compareRepaymentPlans({
      ...baseParameters,
      annualInterestRatePercent: rate ?? 0,
      interestRateAfterInterestOnlyPeriodPercent: rate ?? 0,
      numberOfInterestOnlyTerms: 0,
    })

    expect(
      plainLoanAtThatRate.planWithoutInterestOnlyPeriod.totalInterestCost,
    ).toBeCloseTo(comparison.planWithInterestOnlyPeriod.totalInterestCost, 2)
  })

  it('er null når det ikke finnes noe lån å regne på', () => {
    expect(findEquivalentInterestRatePercent(0, 360, 0)).toBeNull()
    expect(findEquivalentInterestRatePercent(3000000, 0, 0)).toBeNull()
  })

  it('gir null rente når lånet er rentefritt', () => {
    const rate = equivalentRateFor({
      annualInterestRatePercent: 0,
      interestRateAfterInterestOnlyPeriodPercent: 0,
    })

    expect(rate ?? 1).toBeCloseTo(0, 6)
  })
})
