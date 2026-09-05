import { clampLoanParameters } from './constraints'
import type { LoanParameters } from './types'

const PRINCIPAL_KEY = 'belop'
const INTEREST_RATE_KEY = 'rente'
const INTEREST_RATE_AFTER_KEY = 'nyrente'
const TERMS_KEY = 'terminer'
const INTEREST_ONLY_TERMS_KEY = 'avdragsfrie'

function readNumber(
  searchParameters: URLSearchParams,
  key: string,
  fallback: number,
): number {
  const rawValue = searchParameters.get(key)

  if (rawValue === null || rawValue.trim() === '') {
    return fallback
  }

  const parsedValue = Number(rawValue)

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallback
  }

  return parsedValue
}

export function readLoanParametersFromSearch(
  search: string,
  fallback: LoanParameters,
): LoanParameters {
  const searchParameters = new URLSearchParams(search)

  return clampLoanParameters({
    principal: readNumber(searchParameters, PRINCIPAL_KEY, fallback.principal),
    annualInterestRatePercent: readNumber(
      searchParameters,
      INTEREST_RATE_KEY,
      fallback.annualInterestRatePercent,
    ),
    interestRateAfterInterestOnlyPeriodPercent: readNumber(
      searchParameters,
      INTEREST_RATE_AFTER_KEY,
      fallback.interestRateAfterInterestOnlyPeriodPercent,
    ),
    numberOfTerms: readNumber(
      searchParameters,
      TERMS_KEY,
      fallback.numberOfTerms,
    ),
    numberOfInterestOnlyTerms: readNumber(
      searchParameters,
      INTEREST_ONLY_TERMS_KEY,
      fallback.numberOfInterestOnlyTerms,
    ),
  })
}

export function buildSearchFromLoanParameters(
  loanParameters: LoanParameters,
): string {
  const searchParameters = new URLSearchParams()

  searchParameters.set(PRINCIPAL_KEY, String(loanParameters.principal))
  searchParameters.set(
    INTEREST_RATE_KEY,
    String(loanParameters.annualInterestRatePercent),
  )
  searchParameters.set(
    INTEREST_RATE_AFTER_KEY,
    String(loanParameters.interestRateAfterInterestOnlyPeriodPercent),
  )
  searchParameters.set(TERMS_KEY, String(loanParameters.numberOfTerms))
  searchParameters.set(
    INTEREST_ONLY_TERMS_KEY,
    String(loanParameters.numberOfInterestOnlyTerms),
  )

  return searchParameters.toString()
}
