import { useMemo } from 'react'
import {
  formatCurrency,
  formatTermsAsYearsAndMonths,
} from '../formatting/formatting'
import type { KeyFigure, KeyFigureHeadline } from '../key-figures/types'
import type {
  LoanParameters,
  RepaymentPlanComparison,
} from '../repayment-plan/types'
import type { KeyFigureContent } from './types'

export function useSimpleKeyFigures(
  loanParameters: LoanParameters,
  comparison: RepaymentPlanComparison,
): KeyFigureContent {
  return useMemo(() => {
    const hasInterestOnlyPeriod = loanParameters.numberOfInterestOnlyTerms > 0

    const headline: KeyFigureHeadline = {
      label: 'Avdragsfriheten koster deg',
      value: formatCurrency(comparison.additionalCostOfInterestOnlyPeriod),
      note: hasInterestOnlyPeriod
        ? `ekstra i renter. Du betaler mindre i ${formatTermsAsYearsAndMonths(loanParameters.numberOfInterestOnlyTerms)}, og må nedbetale hele lånet på ${formatTermsAsYearsAndMonths(comparison.numberOfTermsWithRepayment)} i stedet for ${formatTermsAsYearsAndMonths(loanParameters.numberOfTerms)}.`
        : 'Du har ikke lagt inn avdragsfrihet, så det koster deg ingenting.',
    }

    const figures: KeyFigure[] = [
      {
        label: 'Terminbeløp under avdragsfrihet',
        value: formatCurrency(comparison.paymentDuringInterestOnlyPeriod),
        note: `${formatCurrency(comparison.monthlySavingDuringInterestOnlyPeriod)} lavere i måneden`,
        noteTone: 'positive',
      },
      {
        label: 'Terminbeløp etter avdragsfrihet',
        value: formatCurrency(comparison.paymentAfterInterestOnlyPeriod),
        note: `${formatCurrency(comparison.monthlyIncreaseAfterInterestOnlyPeriod)} høyere i måneden`,
        noteTone: 'negative',
      },
      {
        label: 'Total kostnad med avdragsfrihet',
        value: formatCurrency(comparison.planWithInterestOnlyPeriod.totalCost),
        note: `Herav ${formatCurrency(comparison.planWithInterestOnlyPeriod.totalInterestCost)} i renter`,
      },
      {
        label: 'Total kostnad uten avdragsfrihet',
        value: formatCurrency(
          comparison.planWithoutInterestOnlyPeriod.totalCost,
        ),
        note: `Herav ${formatCurrency(comparison.planWithoutInterestOnlyPeriod.totalInterestCost)} i renter`,
      },
    ]

    return { headline, figures }
  }, [loanParameters, comparison])
}
