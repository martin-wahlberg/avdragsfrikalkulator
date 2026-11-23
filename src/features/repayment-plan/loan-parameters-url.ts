import { clampLoanParameters } from './constraints'
import type { LoanParameters } from './types'

const PRINCIPAL_KEY = 'belop'
const INTEREST_RATE_KEY = 'rente'
const INTEREST_RATE_AFTER_KEY = 'nyrente'
const TERMS_KEY = 'terminer'
const INTEREST_ONLY_TERMS_KEY = 'avdragsfrie'
const EXTENDS_TERM_KEY = 'forleng'

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

function readFlag(
  searchParameters: URLSearchParams,
  key: string,
  fallback: boolean,
): boolean {
  const rawValue = searchParameters.get(key)

  if (rawValue === null) {
    return fallback
  }

  return rawValue === '1' || rawValue === 'true'
}

export function readLoanParametersFromSearch(
  search: string,
  fallback: LoanParameters,
): LoanParameters {
  const searchParameters = new URLSearchParams(search)
  const annualInterestRatePercent = readNumber(
    searchParameters,
    INTEREST_RATE_KEY,
    fallback.annualInterestRatePercent,
  )

  return clampLoanParameters({
    principal: readNumber(searchParameters, PRINCIPAL_KEY, fallback.principal),
    annualInterestRatePercent,
    interestRateAfterInterestOnlyPeriodPercent: readNumber(
      searchParameters,
      INTEREST_RATE_AFTER_KEY,
      annualInterestRatePercent,
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
    extendsTermByInterestOnlyPeriod: readFlag(
      searchParameters,
      EXTENDS_TERM_KEY,
      fallback.extendsTermByInterestOnlyPeriod,
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
  searchParameters.set(
    EXTENDS_TERM_KEY,
    loanParameters.extendsTermByInterestOnlyPeriod ? '1' : '0',
  )

  return searchParameters.toString()
}
