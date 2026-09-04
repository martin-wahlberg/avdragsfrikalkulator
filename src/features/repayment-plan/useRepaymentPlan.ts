import { useEffect, useMemo, useState } from 'react'
import { compareRepaymentPlans } from './calculations'
import {
  buildSearchFromLoanParameters,
  readLoanParametersFromSearch,
} from './loanParametersUrl'
import type { LoanParameters, RepaymentPlanComparison } from './types'

export const DEFAULT_LOAN_PARAMETERS: LoanParameters = {
  principal: 676721,
  annualInterestRatePercent: 5.2,
  numberOfTerms: 360,
  numberOfInterestOnlyTerms: 60,
}

export interface RepaymentPlanState {
  loanParameters: LoanParameters
  setPrincipal: (principal: number) => void
  setAnnualInterestRatePercent: (annualInterestRatePercent: number) => void
  setNumberOfTerms: (numberOfTerms: number) => void
  setNumberOfInterestOnlyTerms: (numberOfInterestOnlyTerms: number) => void
  resetToDefaults: () => void
  comparison: RepaymentPlanComparison
}

function limitInterestOnlyPeriodToLoanTerm(
  loanParameters: LoanParameters,
): LoanParameters {
  if (
    loanParameters.numberOfInterestOnlyTerms <= loanParameters.numberOfTerms
  ) {
    return loanParameters
  }

  return {
    ...loanParameters,
    numberOfInterestOnlyTerms: loanParameters.numberOfTerms,
  }
}

export function useRepaymentPlan(): RepaymentPlanState {
  const [loanParameters, setLoanParameters] = useState<LoanParameters>(() =>
    readLoanParametersFromSearch(
      window.location.search,
      DEFAULT_LOAN_PARAMETERS,
    ),
  )

  useEffect(() => {
    const search = buildSearchFromLoanParameters(loanParameters)

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${search}`,
    )
  }, [loanParameters])

  const comparison = useMemo(
    () => compareRepaymentPlans(loanParameters),
    [loanParameters],
  )

  return {
    loanParameters,
    comparison,
    setPrincipal: (principal) =>
      setLoanParameters((previous) => ({ ...previous, principal })),
    setAnnualInterestRatePercent: (annualInterestRatePercent) =>
      setLoanParameters((previous) => ({
        ...previous,
        annualInterestRatePercent,
      })),
    setNumberOfTerms: (numberOfTerms) =>
      setLoanParameters((previous) =>
        limitInterestOnlyPeriodToLoanTerm({ ...previous, numberOfTerms }),
      ),
    setNumberOfInterestOnlyTerms: (numberOfInterestOnlyTerms) =>
      setLoanParameters((previous) =>
        limitInterestOnlyPeriodToLoanTerm({
          ...previous,
          numberOfInterestOnlyTerms,
        }),
      ),
    resetToDefaults: () => setLoanParameters(DEFAULT_LOAN_PARAMETERS),
  }
}
