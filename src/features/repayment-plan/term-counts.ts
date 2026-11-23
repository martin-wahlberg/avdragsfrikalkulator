import type { LoanParameters, TermCounts } from './types'

/**
 * Avdragsfriheten kan enten spise av lopetiden eller legges til den.
 *
 * Spiser av: 30 ar lopetid med 5 ar fri gir 25 ar med avdrag.
 * Legges til: 30 ar lopetid med 5 ar fri gir 30 ar med avdrag, 35 totalt.
 *
 * Sammenligningsgrunnlaget er det samme i begge tilfeller: lanet slik du
 * skrev det inn, uten avdragsfrihet.
 */
export function countTerms({
  numberOfTerms,
  numberOfInterestOnlyTerms,
  extendsTermByInterestOnlyPeriod,
}: LoanParameters): TermCounts {
  const numberOfTermsWithRepayment = extendsTermByInterestOnlyPeriod
    ? numberOfTerms
    : numberOfTerms - numberOfInterestOnlyTerms

  return {
    numberOfTermsWithRepayment,
    totalNumberOfTerms: numberOfInterestOnlyTerms + numberOfTermsWithRepayment,
  }
}
