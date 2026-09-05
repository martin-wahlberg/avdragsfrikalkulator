import { describe, expect, it } from 'vitest'
import { calculateMonthlyInterestRate, calculatePayment } from './annuity'
import { compareRepaymentPlans } from './calculations'
import { findEqualPaymentInterestRatePercent } from './equal-payment-rate'
import type { LoanParameters } from './types'

const baseParameters: LoanParameters = {
  principal: 3000000,
  annualInterestRatePercent: 5,
  interestRateAfterInterestOnlyPeriodPercent: 5,
  numberOfTerms: 360,
  numberOfInterestOnlyTerms: 60,
}

function withRateAfter(rateAfter: number): LoanParameters {
  return {
    ...baseParameters,
    interestRateAfterInterestOnlyPeriodPercent: rateAfter,
  }
}

describe('uendret rente gir samme resultat som en enkelt annuitet', () => {
  const comparison = compareRepaymentPlans(baseParameters)

  it('holder terminbelopet flatt gjennom rentebyttet', () => {
    expect(
      comparison.paymentAfterRateChangeWithoutInterestOnlyPeriod,
    ).toBeCloseTo(comparison.paymentWithoutInterestOnlyPeriod, 6)
  })

  it('gir samme terminbelop i hver eneste termin', () => {
    const terms = comparison.planWithoutInterestOnlyPeriod.terms
    const expectedPayment = comparison.paymentWithoutInterestOnlyPeriod

    for (const term of terms) {
      expect(term.payment).toBeCloseTo(expectedPayment, 6)
    }
  })
})

describe('rentefall fra termin 61', () => {
  const comparison = compareRepaymentPlans(withRateAfter(3))

  it('senker terminbelopet i begge scenarioene', () => {
    expect(
      comparison.paymentAfterRateChangeWithoutInterestOnlyPeriod,
    ).toBeLessThan(comparison.paymentWithoutInterestOnlyPeriod)
    expect(comparison.paymentAfterInterestOnlyPeriod).toBeLessThan(
      comparison.paymentWithoutInterestOnlyPeriod,
    )
  })

  it('bytter rente presis i termin 61, ikke for', () => {
    const terms = comparison.planWithoutInterestOnlyPeriod.terms
    const monthlyRateBefore = calculateMonthlyInterestRate(5)
    const monthlyRateAfter = calculateMonthlyInterestRate(3)

    expect(terms[59].interest / terms[58].remainingDebt).toBeCloseTo(
      monthlyRateBefore,
      12,
    )
    expect(terms[60].interest / terms[59].remainingDebt).toBeCloseTo(
      monthlyRateAfter,
      12,
    )
  })

  it('lar avdragsfriheten fortsatt koste penger', () => {
    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeGreaterThan(0)
  })

  it('nedbetaler begge lanene helt', () => {
    for (const plan of [
      comparison.planWithoutInterestOnlyPeriod,
      comparison.planWithInterestOnlyPeriod,
    ]) {
      expect(plan.terms[plan.terms.length - 1].remainingDebt).toBeCloseTo(0, 6)
    }
  })

  it('regner avdragsfri periode til opprinnelig rente', () => {
    const terms = comparison.planWithInterestOnlyPeriod.terms

    expect(terms[0].payment).toBeCloseTo(
      3000000 * calculateMonthlyInterestRate(5),
      6,
    )
    expect(terms[59].remainingDebt).toBeCloseTo(3000000, 6)
  })
})

describe('findEqualPaymentInterestRatePercent', () => {
  it('finner renten som gir samme terminbelop som referansen', () => {
    const rate = findEqualPaymentInterestRatePercent(baseParameters)

    expect(rate).not.toBeNull()

    if (rate === null) {
      return
    }

    const referencePayment = calculatePayment(
      calculateMonthlyInterestRate(5),
      360,
      3000000,
    )
    const paymentAtSolvedRate = calculatePayment(
      calculateMonthlyInterestRate(rate),
      300,
      3000000,
    )

    expect(paymentAtSolvedRate).toBeCloseTo(referencePayment, 4)
  })

  it('ligger under opprinnelig rente nar det finnes avdragsfrihet', () => {
    const rate = findEqualPaymentInterestRatePercent(baseParameters)

    expect(rate).toBeLessThan(5)
    expect(rate).toBeGreaterThan(0)
  })

  it('er lik opprinnelig rente uten avdragsfrihet', () => {
    expect(
      findEqualPaymentInterestRatePercent({
        ...baseParameters,
        numberOfInterestOnlyTerms: 0,
      }),
    ).toBeCloseTo(5, 4)
  })

  it('finnes ikke nar selv nullrente gir hoyere terminbelop', () => {
    expect(
      findEqualPaymentInterestRatePercent({
        ...baseParameters,
        numberOfInterestOnlyTerms: 300,
      }),
    ).toBeNull()
  })
})
