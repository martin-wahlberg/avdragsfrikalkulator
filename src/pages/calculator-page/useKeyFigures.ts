import { useMemo } from 'react'
import type {
  KeyFigure,
  KeyFigureHeadline,
} from '../../features/key-figures/KeyFigures'
import type {
  LoanParameters,
  RepaymentPlanComparison,
} from '../../features/repayment-plan/types'
import {
  formatCurrency,
  formatTermsAsYearsAndMonths,
} from '../../lib/formatting'

export interface KeyFigureContent {
  headline: KeyFigureHeadline
  figures: KeyFigure[]
}

export function useKeyFigures(
  loanParameters: LoanParameters,
  comparison: RepaymentPlanComparison,
): KeyFigureContent {
  return useMemo(() => {
    const hasInterestOnlyPeriod = loanParameters.numberOfInterestOnlyTerms > 0

    const headline: KeyFigureHeadline = {
      label: 'Avdragsfriheten koster deg',
      value: formatCurrency(comparison.additionalCostOfInterestOnlyPeriod),
      note: hasInterestOnlyPeriod
        ? `ekstra i renter over hele løpetiden, fordi gjelden står stille i ${formatTermsAsYearsAndMonths(loanParameters.numberOfInterestOnlyTerms)} og må nedbetales på ${formatTermsAsYearsAndMonths(comparison.numberOfTermsWithRepayment)} i stedet for ${formatTermsAsYearsAndMonths(loanParameters.numberOfTerms)}.`
        : 'Du har ikke lagt inn noen avdragsfrie terminer, så de to planene er identiske.',
    }

    const figures: KeyFigure[] = [
      {
        label: 'Terminbeløp uten avdragsfrihet',
        value: formatCurrency(comparison.paymentWithoutInterestOnlyPeriod),
        note: `Likt hver måned i ${formatTermsAsYearsAndMonths(loanParameters.numberOfTerms)}.`,
      },
      {
        label: 'Terminbeløp i avdragsfri periode',
        value: formatCurrency(comparison.paymentDuringInterestOnlyPeriod),
        note: `${formatCurrency(comparison.monthlySavingDuringInterestOnlyPeriod)} lavere i måneden`,
        noteTone: 'positive',
      },
      {
        label: 'Terminbeløp etter avdragsfriheten',
        value: formatCurrency(comparison.paymentAfterInterestOnlyPeriod),
        note: `${formatCurrency(comparison.monthlyIncreaseAfterInterestOnlyPeriod)} høyere i måneden`,
        noteTone: 'negative',
      },
      {
        label: 'Total kostnad uten avdragsfrihet',
        value: formatCurrency(comparison.planWithoutInterestOnlyPeriod.totalCost),
        note: `Herav ${formatCurrency(comparison.planWithoutInterestOnlyPeriod.totalInterestCost)} i renter`,
      },
      {
        label: 'Total kostnad med avdragsfrihet',
        value: formatCurrency(comparison.planWithInterestOnlyPeriod.totalCost),
        note: `Herav ${formatCurrency(comparison.planWithInterestOnlyPeriod.totalInterestCost)} i renter`,
      },
      {
        label: 'Terminer med avdrag',
        value: `${comparison.numberOfTermsWithRepayment}`,
        note: `${formatTermsAsYearsAndMonths(comparison.numberOfTermsWithRepayment)} til å nedbetale hele lånet`,
      },
    ]

    return { headline, figures }
  }, [loanParameters, comparison])
}
