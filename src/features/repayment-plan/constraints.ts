import type { LoanParameters } from './types'

export const MINIMUM_TERMS_WITH_REPAYMENT = 12

export function maximumInterestOnlyTermsFor(numberOfTerms: number): number {
  return Math.max(numberOfTerms - MINIMUM_TERMS_WITH_REPAYMENT, 0)
}

export function clampLoanParameters(
  loanParameters: LoanParameters,
): LoanParameters {
  const numberOfTerms = Math.max(
    Math.round(loanParameters.numberOfTerms),
    MINIMUM_TERMS_WITH_REPAYMENT,
  )

  const numberOfInterestOnlyTerms = Math.min(
    Math.max(Math.round(loanParameters.numberOfInterestOnlyTerms), 0),
    maximumInterestOnlyTermsFor(numberOfTerms),
  )

  return {
    ...loanParameters,
    principal: Math.max(loanParameters.principal, 0),
    annualInterestRatePercent: Math.max(
      loanParameters.annualInterestRatePercent,
      0,
    ),
    interestRateAfterInterestOnlyPeriodPercent: Math.max(
      loanParameters.interestRateAfterInterestOnlyPeriodPercent,
      0,
    ),
    numberOfTerms,
    numberOfInterestOnlyTerms,
  }
}
