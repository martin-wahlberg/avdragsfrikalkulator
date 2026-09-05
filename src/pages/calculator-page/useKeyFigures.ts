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
  formatPercent,
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
    const rateChanges =
      loanParameters.interestRateAfterInterestOnlyPeriodPercent !==
      loanParameters.annualInterestRatePercent
    const rateChangeSuffix = rateChanges
      ? ` til ${formatPercent(loanParameters.interestRateAfterInterestOnlyPeriodPercent)}`
      : ''

    const headline: KeyFigureHeadline = {
      label: 'Avdragsfriheten koster deg',
      value: formatCurrency(comparison.additionalCostOfInterestOnlyPeriod),
      note: hasInterestOnlyPeriod
        ? `ekstra over hele løpetiden. Gjelden står stille i ${formatTermsAsYearsAndMonths(loanParameters.numberOfInterestOnlyTerms)} og må nedbetales på ${formatTermsAsYearsAndMonths(comparison.numberOfTermsWithRepayment)} i stedet for ${formatTermsAsYearsAndMonths(loanParameters.numberOfTerms)}. Begge scenarioene bytter rente${rateChangeSuffix} fra termin ${loanParameters.numberOfInterestOnlyTerms + 1}.`
        : 'Du har ikke lagt inn noen avdragsfrie terminer, så de to planene er identiske.',
    }

    const figures: KeyFigure[] = [
      {
        label: 'Terminbeløp før renteendring',
        value: formatCurrency(comparison.paymentWithoutInterestOnlyPeriod),
        note: `Uten avdragsfrihet, til ${formatPercent(loanParameters.annualInterestRatePercent)}`,
      },
      {
        label: 'Terminbeløp i avdragsfri periode',
        value: formatCurrency(comparison.paymentDuringInterestOnlyPeriod),
        note: `${formatCurrency(comparison.monthlySavingDuringInterestOnlyPeriod)} lavere i måneden`,
        noteTone: 'positive',
      },
      {
        label: 'Etter renteendring, uten avdragsfrihet',
        value: formatCurrency(
          comparison.paymentAfterRateChangeWithoutInterestOnlyPeriod,
        ),
        note: `Restgjelden reberegnes over ${formatTermsAsYearsAndMonths(comparison.numberOfTermsWithRepayment)}`,
      },
      {
        label: 'Etter renteendring, med avdragsfrihet',
        value: formatCurrency(comparison.paymentAfterInterestOnlyPeriod),
        note: `${formatCurrency(comparison.monthlyIncreaseAfterInterestOnlyPeriod)} høyere i måneden`,
        noteTone: 'negative',
      },
      {
        label: 'Total kostnad uten avdragsfrihet',
        value: formatCurrency(
          comparison.planWithoutInterestOnlyPeriod.totalCost,
        ),
        note: `Herav ${formatCurrency(comparison.planWithoutInterestOnlyPeriod.totalInterestCost)} i renter`,
      },
      {
        label: 'Total kostnad med avdragsfrihet',
        value: formatCurrency(comparison.planWithInterestOnlyPeriod.totalCost),
        note: `Herav ${formatCurrency(comparison.planWithInterestOnlyPeriod.totalInterestCost)} i renter`,
      },
      {
        label:
          'Rente som gir likt terminbeløp som opprinnelig uten avdragsfrihet',
        value:
          comparison.equalPaymentInterestRatePercent === null
            ? 'Finnes ikke'
            : formatPercent(comparison.equalPaymentInterestRatePercent),
        note:
          comparison.equalPaymentInterestRatePercent === null
            ? 'Selv rentefritt blir terminbeløpet høyere, fordi lånet må nedbetales på færre terminer.'
            : 'Renta du må ned til for å få samme terminbeløp som opprinnelig. Men renta faller da også om man har betalt ned fra start.',
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
