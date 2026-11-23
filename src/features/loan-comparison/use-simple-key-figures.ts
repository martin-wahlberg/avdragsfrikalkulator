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
import { buildCalculationExplanations } from './calculation-explanations'
import type { KeyFigureContent } from './types'

export function useSimpleKeyFigures(
  loanParameters: LoanParameters,
  comparison: RepaymentPlanComparison,
): KeyFigureContent {
  return useMemo(() => {
    const calculations = buildCalculationExplanations(
      loanParameters,
      comparison,
    )
    const hasInterestOnlyPeriod = loanParameters.numberOfInterestOnlyTerms > 0
    const freePeriod = formatTermsAsYearsAndMonths(
      loanParameters.numberOfInterestOnlyTerms,
    )

    const headlineNote = loanParameters.extendsTermByInterestOnlyPeriod
      ? `ekstra i renter. Du betaler bare renter i ${freePeriod}, og lånet løper ${formatTermsAsYearsAndMonths(comparison.totalNumberOfTerms)} i stedet for ${formatTermsAsYearsAndMonths(loanParameters.numberOfTerms)}.`
      : `ekstra i renter. Du betaler mindre i ${freePeriod}, og må nedbetale hele lånet på ${formatTermsAsYearsAndMonths(comparison.numberOfTermsWithRepayment)} i stedet for ${formatTermsAsYearsAndMonths(loanParameters.numberOfTerms)}.`

    const headline: KeyFigureHeadline = {
      label: 'Avdragsfriheten koster deg',
      value: formatCurrency(comparison.additionalCostOfInterestOnlyPeriod),
      note: hasInterestOnlyPeriod
        ? headlineNote
        : 'Du har ikke lagt inn avdragsfrihet, så det koster deg ingenting.',
      calculation: calculations.additionalCost,
    }

    const figures: KeyFigure[] = [
      {
        label: 'Terminbeløp under avdragsfrihet',
        value: formatCurrency(comparison.paymentDuringInterestOnlyPeriod),
        note: `${formatCurrency(comparison.monthlySavingDuringInterestOnlyPeriod)} lavere i måneden`,
        noteTone: 'positive',
        calculation: calculations.paymentDuringInterestOnlyPeriod,
      },
      {
        label: 'Terminbeløp etter avdragsfrihet',
        value: formatCurrency(comparison.paymentAfterInterestOnlyPeriod),
        note: loanParameters.extendsTermByInterestOnlyPeriod
          ? 'Uendret, men du betaler det i flere år'
          : `${formatCurrency(comparison.monthlyIncreaseAfterInterestOnlyPeriod)} høyere i måneden`,
        noteTone: loanParameters.extendsTermByInterestOnlyPeriod
          ? 'neutral'
          : 'negative',
        calculation: calculations.paymentAfterInterestOnlyPeriod,
      },
      {
        label: 'Total kostnad med avdragsfrihet',
        value: formatCurrency(comparison.planWithInterestOnlyPeriod.totalCost),
        note: `Herav ${formatCurrency(comparison.planWithInterestOnlyPeriod.totalInterestCost)} i renter`,
        calculation: calculations.totalCostWithInterestOnlyPeriod,
      },
      {
        label: 'Total kostnad uten avdragsfrihet',
        value: formatCurrency(
          comparison.planWithoutInterestOnlyPeriod.totalCost,
        ),
        note: `Herav ${formatCurrency(comparison.planWithoutInterestOnlyPeriod.totalInterestCost)} i renter`,
        calculation: calculations.totalCostWithoutInterestOnlyPeriod,
      },
    ]

    return { headline, figures }
  }, [loanParameters, comparison])
}
