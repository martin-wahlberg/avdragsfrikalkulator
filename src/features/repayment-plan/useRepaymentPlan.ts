import { useEffect, useMemo, useState } from 'react'
import { compareRepaymentPlans } from './calculations'
import { clampLoanParameters } from './constraints'
import {
  buildSearchFromLoanParameters,
  readLoanParametersFromSearch,
} from './loanParametersUrl'
import type { LoanParameters, RepaymentPlanComparison } from './types'

export const DEFAULT_LOAN_PARAMETERS: LoanParameters = {
  principal: 3000000,
  annualInterestRatePercent: 5,
  interestRateAfterInterestOnlyPeriodPercent: 5,
  numberOfTerms: 360,
  numberOfInterestOnlyTerms: 60,
}

export interface RepaymentPlanState {
  loanParameters: LoanParameters
  setPrincipal: (principal: number) => void
  setAnnualInterestRatePercent: (annualInterestRatePercent: number) => void
  setInterestRateAfterInterestOnlyPeriodPercent: (
    interestRateAfterInterestOnlyPeriodPercent: number,
  ) => void
  setNumberOfTerms: (numberOfTerms: number) => void
  setNumberOfInterestOnlyTerms: (numberOfInterestOnlyTerms: number) => void
  resetToDefaults: () => void
  comparison: RepaymentPlanComparison
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
      setLoanParameters((previous) =>
        clampLoanParameters({ ...previous, principal }),
      ),
    setAnnualInterestRatePercent: (annualInterestRatePercent) =>
      setLoanParameters((previous) =>
        clampLoanParameters({ ...previous, annualInterestRatePercent }),
      ),
    setInterestRateAfterInterestOnlyPeriodPercent: (
      interestRateAfterInterestOnlyPeriodPercent,
    ) =>
      setLoanParameters((previous) =>
        clampLoanParameters({
          ...previous,
          interestRateAfterInterestOnlyPeriodPercent,
        }),
      ),
    setNumberOfTerms: (numberOfTerms) =>
      setLoanParameters((previous) =>
        clampLoanParameters({ ...previous, numberOfTerms }),
      ),
    setNumberOfInterestOnlyTerms: (numberOfInterestOnlyTerms) =>
      setLoanParameters((previous) =>
        clampLoanParameters({ ...previous, numberOfInterestOnlyTerms }),
      ),
    resetToDefaults: () => setLoanParameters(DEFAULT_LOAN_PARAMETERS),
  }
}
