import { describe, expect, it } from 'vitest'
import { calculateMonthlyInterestRate, calculatePayment } from './annuity'
import { compareRepaymentPlans } from './calculations'
import { clampLoanParameters } from './constraints'
import { countTerms } from './term-counts'
import type { LoanParameters } from './types'

const baseParameters: LoanParameters = {
  principal: 3000000,
  annualInterestRatePercent: 5.1,
  interestRateAfterInterestOnlyPeriodPercent: 5.1,
  numberOfTerms: 360,
  numberOfInterestOnlyTerms: 60,
  extendsTermByInterestOnlyPeriod: true,
}

describe('countTerms', () => {
  it('spiser av lopetiden nar avdragsfriheten ikke legges til', () => {
    expect(
      countTerms({ ...baseParameters, extendsTermByInterestOnlyPeriod: false }),
    ).toEqual({
      numberOfInterestOnlyTerms: 60,
      numberOfTermsWithRepayment: 300,
      totalNumberOfTerms: 360,
    })
  })

  it('legger avdragsfriheten til lopetiden', () => {
    expect(countTerms(baseParameters)).toEqual({
      numberOfInterestOnlyTerms: 60,
      numberOfTermsWithRepayment: 360,
      totalNumberOfTerms: 420,
    })
  })
})

describe('avdragsfrihet lagt til lopetiden', () => {
  const comparison = compareRepaymentPlans(baseParameters)

  it('gir 30 ar nedbetaling og 35 ar totalt', () => {
    expect(comparison.numberOfTermsWithRepayment).toBe(360)
    expect(comparison.totalNumberOfTerms).toBe(420)
    expect(comparison.planWithInterestOnlyPeriod.terms).toHaveLength(420)
  })

  it('lar sammenligningsgrunnlaget vare lanet pa 30 ar', () => {
    expect(comparison.planWithoutInterestOnlyPeriod.terms).toHaveLength(360)
  })

  it('holder terminbelopet uendret etter den avdragsfrie perioden', () => {
    expect(comparison.paymentAfterInterestOnlyPeriod).toBeCloseTo(
      comparison.paymentWithoutInterestOnlyPeriod,
      6,
    )
    expect(comparison.monthlyIncreaseAfterInterestOnlyPeriod).toBeCloseTo(0, 6)
  })

  it('koster nettopp rentene i den avdragsfrie perioden', () => {
    const monthlyInterest =
      3000000 * calculateMonthlyInterestRate(5.1)

    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeCloseTo(
      monthlyInterest * 60,
      4,
    )
  })

  it('nedbetaler lanet helt i siste termin', () => {
    const terms = comparison.planWithInterestOnlyPeriod.terms

    expect(terms[terms.length - 1].remainingDebt).toBeCloseTo(0, 6)
  })

  it('holder gjelden i ro gjennom hele den avdragsfrie perioden', () => {
    const terms = comparison.planWithInterestOnlyPeriod.terms

    for (const term of terms.slice(0, 60)) {
      expect(term.principalRepayment).toBe(0)
      expect(term.remainingDebt).toBeCloseTo(3000000, 6)
    }
  })

  it('koster mer enn nar avdragsfriheten spiser av lopetiden', () => {
    const eatsIntoTerm = compareRepaymentPlans({
      ...baseParameters,
      extendsTermByInterestOnlyPeriod: false,
    })

    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeGreaterThan(
      eatsIntoTerm.additionalCostOfInterestOnlyPeriod,
    )
  })

  it('tar hele terminbelopet fra annuiteten over full lopetid', () => {
    expect(comparison.paymentAfterInterestOnlyPeriod).toBeCloseTo(
      calculatePayment(calculateMonthlyInterestRate(5.1), 360, 3000000),
      6,
    )
  })
})

describe('grenser i den nye modusen', () => {
  it('tillater avdragsfrihet lenger enn lopetiden', () => {
    const clamped = clampLoanParameters({
      ...baseParameters,
      numberOfInterestOnlyTerms: 600,
    })

    expect(clamped.numberOfInterestOnlyTerms).toBe(600)
    expect(countTerms(clamped).totalNumberOfTerms).toBe(960)
  })

  it('begrenser avdragsfriheten i beregningen, ikke i tilstanden', () => {
    const parameters = {
      ...baseParameters,
      numberOfInterestOnlyTerms: 600,
      extendsTermByInterestOnlyPeriod: false,
    }

    expect(clampLoanParameters(parameters).numberOfInterestOnlyTerms).toBe(600)
    expect(countTerms(parameters).numberOfInterestOnlyTerms).toBe(359)
    expect(countTerms(parameters).numberOfTermsWithRepayment).toBe(1)
  })

  it('gir avdragsfriheten tilbake nar lopetiden okes igjen', () => {
    const shortened = { ...baseParameters, numberOfTerms: 24 }
    const restored = clampLoanParameters({ ...shortened, numberOfTerms: 360 })

    expect(restored.numberOfInterestOnlyTerms).toBe(60)
  })

  it('gir like planer uten avdragsfrie terminer', () => {
    const comparison = compareRepaymentPlans({
      ...baseParameters,
      numberOfInterestOnlyTerms: 0,
    })

    expect(comparison.additionalCostOfInterestOnlyPeriod).toBeCloseTo(0, 6)
    expect(comparison.totalNumberOfTerms).toBe(360)
  })
})
