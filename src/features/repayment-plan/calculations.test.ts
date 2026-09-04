import { describe, expect, it } from 'vitest'
import { compareRepaymentPlans } from './calculations'
import type { LoanParameters, Term } from './types'

const parametersFromSourceSpreadsheet: LoanParameters = {
  principal: 676721,
  annualInterestRatePercent: 5.2,
  numberOfTerms: 360,
  numberOfInterestOnlyTerms: 60,
}

function lastTerm(terms: Term[]): Term {
  return terms[terms.length - 1]
}

describe('compareRepaymentPlans against the source spreadsheet', () => {
  const comparison = compareRepaymentPlans(parametersFromSourceSpreadsheet)

  it('matches the payment without an interest only period', () => {
    expect(comparison.paymentWithoutInterestOnlyPeriod).toBeCloseTo(
      3715.948645,
      5,
    )
  })

  it('matches the total cost without an interest only period', () => {
    expect(comparison.planWithoutInterestOnlyPeriod.totalCost).toBeCloseTo(
      1337741.512,
      2,
    )
  })

  it('matches the total cost with an interest only period', () => {
    expect(comparison.planWithInterestOnlyPeriod.totalCost).toBeCloseTo(
      1386536.74,
      2,
    )
  })

  it('matches the additional cost of the interest only period', () => {
    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeCloseTo(
      48795.2275,
      2,
    )
  })

  it('pays interest only throughout the interest only period', () => {
    const interestOnlyTerms =
      comparison.planWithInterestOnlyPeriod.terms.slice(0, 60)

    for (const term of interestOnlyTerms) {
      expect(term.principalRepayment).toBe(0)
      expect(term.payment).toBeCloseTo(2932.457667, 5)
      expect(term.remainingDebt).toBeCloseTo(676721, 6)
    }
  })

  it('starts repaying principal in term 61', () => {
    const termSixtyOne = comparison.planWithInterestOnlyPeriod.terms[60]

    expect(termSixtyOne.termNumber).toBe(61)
    expect(termSixtyOne.payment).toBeCloseTo(4035.3, 2)
    expect(termSixtyOne.interest).toBeCloseTo(2932.457667, 5)
    expect(termSixtyOne.principalRepayment).toBeCloseTo(1102.84, 2)
    expect(termSixtyOne.remainingDebt).toBeCloseTo(675618.16, 2)
  })

  it('repays both loans fully in the final term', () => {
    expect(
      lastTerm(comparison.planWithoutInterestOnlyPeriod.terms).remainingDebt,
    ).toBeCloseTo(0, 6)
    expect(
      lastTerm(comparison.planWithInterestOnlyPeriod.terms).remainingDebt,
    ).toBeCloseTo(0, 6)
  })

  it('leaves 300 terms with principal repayment', () => {
    expect(comparison.numberOfTermsWithRepayment).toBe(300)
  })
})

describe('compareRepaymentPlans at the boundaries', () => {
  it('produces identical plans when there is no interest only period', () => {
    const comparison = compareRepaymentPlans({
      ...parametersFromSourceSpreadsheet,
      numberOfInterestOnlyTerms: 0,
    })

    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeCloseTo(0, 6)
    expect(comparison.planWithInterestOnlyPeriod.totalCost).toBeCloseTo(
      comparison.planWithoutInterestOnlyPeriod.totalCost,
      6,
    )
  })

  it('treats an interest free loan as straight line repayment', () => {
    const comparison = compareRepaymentPlans({
      principal: 120000,
      annualInterestRatePercent: 0,
      numberOfTerms: 12,
      numberOfInterestOnlyTerms: 0,
    })

    expect(
      comparison.planWithoutInterestOnlyPeriod.terms[0].payment,
    ).toBeCloseTo(10000, 6)
    expect(comparison.planWithoutInterestOnlyPeriod.totalCost).toBeCloseTo(
      120000,
      6,
    )
  })
})
