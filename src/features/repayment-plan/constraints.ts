import type { LoanParameters } from './types'

export const MINIMUM_TERMS_WITH_REPAYMENT = 1

export function maximumInterestOnlyTermsFor(numberOfTerms: number): number {
  return Math.max(numberOfTerms - MINIMUM_TERMS_WITH_REPAYMENT, 0)
}

/**
 * Hvor mange avdragsfrie terminer beregningen faktisk kan bruke.
 *
 * Nar avdragsfriheten spiser av lopetiden ma minst en termin betale avdrag,
 * ellers blir lanet aldri nedbetalt. Begrensningen hoerer hjemme her og ikke i
 * tilstanden: skriver du en kortere lopetid skal ikke avdragsfriheten din bli
 * overskrevet, bare midlertidig begrenset.
 */
export function effectiveInterestOnlyTerms({
  numberOfTerms,
  numberOfInterestOnlyTerms,
  extendsTermByInterestOnlyPeriod,
}: LoanParameters): number {
  if (extendsTermByInterestOnlyPeriod) {
    return numberOfInterestOnlyTerms
  }

  return Math.min(
    numberOfInterestOnlyTerms,
    maximumInterestOnlyTermsFor(numberOfTerms),
  )
}

/**
 * Rydder bare opp i hvert enkelt felt. Ingen felter paavirker hverandre, sa
 * ingenting du har skrevet inn endrer seg fordi du rorer noe annet.
 */
export function clampLoanParameters(
  loanParameters: LoanParameters,
): LoanParameters {
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
    numberOfTerms: Math.max(
      Math.round(loanParameters.numberOfTerms),
      MINIMUM_TERMS_WITH_REPAYMENT,
    ),
    numberOfInterestOnlyTerms: Math.max(
      Math.round(loanParameters.numberOfInterestOnlyTerms),
      0,
    ),
  }
}
