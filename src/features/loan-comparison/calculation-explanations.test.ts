import { describe, expect, it } from 'vitest'
import { compareRepaymentPlans } from '../repayment-plan/calculations'
import type { LoanParameters } from '../repayment-plan/types'
import { buildCalculationExplanations } from './calculation-explanations'

const loanParameters: LoanParameters = {
  principal: 3000000,
  annualInterestRatePercent: 5.1,
  interestRateAfterInterestOnlyPeriodPercent: 4.2,
  numberOfTerms: 360,
  numberOfInterestOnlyTerms: 60,
  extendsTermByInterestOnlyPeriod: false,
}

function explanationsFor(overrides: Partial<LoanParameters>) {
  const parameters = { ...loanParameters, ...overrides }

  return buildCalculationExplanations(
    parameters,
    compareRepaymentPlans(parameters),
  )
}

describe('regnestykkene bak nokkeltallene', () => {
  it('skriver ut hvert regnestykke uten symboler a slaa opp', () => {
    const explanations = explanationsFor({})

    for (const explanation of Object.values(explanations)) {
      expect(explanation).toBeDefined()
      expect(explanation).not.toMatch(/(^|\s)[a-zA-Z](\s|$)/)
    }
  })

  it('setter inn renten i stedet for a vise til den', () => {
    const explanations = explanationsFor({})

    expect(explanations.paymentDuringInterestOnlyPeriod).toContain('5,10 %')
    expect(explanations.paymentAfterInterestOnlyPeriod).toContain('4,20 %')
  })

  it('regner terminene med avdrag ut fra lopetiden', () => {
    expect(explanationsFor({}).termsWithRepayment).toBe('360 − 60 = 300')
  })

  it('dropper regnestykket for terminer med avdrag nar avdragsfriheten legges til', () => {
    expect(
      explanationsFor({ extendsTermByInterestOnlyPeriod: true })
        .termsWithRepayment,
    ).toBeUndefined()
  })

  it('deler totalkostnaden i to nar renten endrer seg underveis', () => {
    expect(explanationsFor({}).totalCostWithoutInterestOnlyPeriod).toMatch(
      /× 60 \+ .+ × 300 =/,
    )
  })

  it('holder totalkostnaden i ett ledd nar renten star stille', () => {
    expect(
      explanationsFor({ interestRateAfterInterestOnlyPeriodPercent: 5.1 })
        .totalCostWithoutInterestOnlyPeriod,
    ).toMatch(/× 360 =/)
  })
})
