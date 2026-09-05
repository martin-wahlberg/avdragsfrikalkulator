import { describe, expect, it } from 'vitest'
import {
  buildSearchFromLoanParameters,
  readLoanParametersFromSearch,
} from './loan-parameters-url'
import type { LoanParameters } from './types'

const fallback: LoanParameters = {
  principal: 676721,
  annualInterestRatePercent: 5.2,
  interestRateAfterInterestOnlyPeriodPercent: 5.2,
  numberOfTerms: 360,
  numberOfInterestOnlyTerms: 60,
}

describe('buildSearchFromLoanParameters', () => {
  it('writes every parameter to the query string', () => {
    expect(buildSearchFromLoanParameters(fallback)).toBe(
      'belop=676721&rente=5.2&nyrente=5.2&terminer=360&avdragsfrie=60',
    )
  })
})

describe('readLoanParametersFromSearch', () => {
  it('reads back exactly what it wrote', () => {
    const shared: LoanParameters = {
      principal: 4200000,
      annualInterestRatePercent: 4.35,
      interestRateAfterInterestOnlyPeriodPercent: 3.9,
      numberOfTerms: 300,
      numberOfInterestOnlyTerms: 24,
    }

    expect(
      readLoanParametersFromSearch(
        buildSearchFromLoanParameters(shared),
        fallback,
      ),
    ).toEqual(shared)
  })

  it('falls back when the query string is empty', () => {
    expect(readLoanParametersFromSearch('', fallback)).toEqual(fallback)
  })

  it('keeps the parameters that are present and falls back on the rest', () => {
    expect(readLoanParametersFromSearch('belop=2000000', fallback)).toEqual({
      ...fallback,
      principal: 2000000,
    })
  })

  it('lar renta stå uendret når lenken bare oppgir nominell rente', () => {
    const parameters = readLoanParametersFromSearch('rente=3.4', fallback)

    expect(parameters.annualInterestRatePercent).toBe(3.4)
    expect(parameters.interestRateAfterInterestOnlyPeriodPercent).toBe(3.4)
  })

  it('ignores values that are not numbers', () => {
    expect(
      readLoanParametersFromSearch('belop=mye&rente=', fallback).principal,
    ).toBe(fallback.principal)
  })

  it('ignores negative values', () => {
    expect(readLoanParametersFromSearch('belop=-500', fallback).principal).toBe(
      fallback.principal,
    )
  })

  it('always leaves twelve terms with repayment, even from a shared link', () => {
    const parameters = readLoanParametersFromSearch(
      'terminer=120&avdragsfrie=240',
      fallback,
    )

    expect(parameters.numberOfTerms).toBe(120)
    expect(parameters.numberOfInterestOnlyTerms).toBe(108)
  })

  it('keeps the loan term at a minimum of twelve terms', () => {
    expect(readLoanParametersFromSearch('terminer=0', fallback).numberOfTerms).toBe(
      12,
    )
  })
})
