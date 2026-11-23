import { useMemo } from 'react'
import type {
  LoanParameters,
  RepaymentPlanComparison,
  Term,
} from '../repayment-plan/types'
import type { LineChartSeries } from '../ui/line-chart/types'
import type { ChartContent, CostChartView } from './types'

const WITHOUT_INTEREST_ONLY_COLOR = '--series-without-interest-only'
const WITH_INTEREST_ONLY_COLOR = '--series-with-interest-only'
const WITHOUT_INTEREST_ONLY_NAME = 'Uten avdragsfrihet'
const WITH_INTEREST_ONLY_NAME = 'Med avdragsfrihet'

function roundUpToNiceStep(value: number): number {
  if (value <= 0) {
    return 1
  }

  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const step = magnitude / 2

  return Math.ceil(value / step) * step
}

/**
 * Planene kan ha ulik lengde nar avdragsfriheten legges til lopetiden. Den
 * korteste fylles ut sa begge dekker hele tidsaksen: gjeld og terminbelop med
 * null, akkumulerte renter med sluttverdien siden det ikke paloper mer.
 */
function padToLength(
  values: number[],
  length: number,
  filler: 'zero' | 'lastValue',
): number[] {
  if (values.length >= length) {
    return values
  }

  const lastValue = values[values.length - 1] ?? 0
  const fillerValue = filler === 'zero' ? 0 : lastValue

  return [
    ...values,
    ...Array.from({ length: length - values.length }, () => fillerValue),
  ]
}

function highestValue(series: LineChartSeries[]): number {
  return series.reduce(
    (highest, oneSeries) => Math.max(highest, ...oneSeries.values),
    0,
  )
}

function remainingDebtOverTime(principal: number, terms: Term[]): number[] {
  return [principal, ...terms.map((term) => term.remainingDebt)]
}

function accumulatedInterestOverTime(terms: Term[]): number[] {
  const accumulated = [0]
  let runningTotal = 0

  for (const term of terms) {
    runningTotal += term.interest
    accumulated.push(runningTotal)
  }

  return accumulated
}

function paymentOverTime(terms: Term[]): number[] {
  const payments = terms.map((term) => term.payment)

  return [payments[0], ...payments]
}

export function useRemainingDebtChart(
  loanParameters: LoanParameters,
  comparison: RepaymentPlanComparison,
): ChartContent {
  return useMemo(() => {
    const pointCount = comparison.totalNumberOfTerms + 1

    return {
      series: [
        {
          name: WITHOUT_INTEREST_ONLY_NAME,
          colorVariableName: WITHOUT_INTEREST_ONLY_COLOR,
          values: padToLength(
            remainingDebtOverTime(
              loanParameters.principal,
              comparison.planWithoutInterestOnlyPeriod.terms,
            ),
            pointCount,
            'zero',
          ),
        },
        {
          name: WITH_INTEREST_ONLY_NAME,
          colorVariableName: WITH_INTEREST_ONLY_COLOR,
          values: padToLength(
            remainingDebtOverTime(
              loanParameters.principal,
              comparison.planWithInterestOnlyPeriod.terms,
            ),
            pointCount,
            'zero',
          ),
        },
      ],
      maximumValue: loanParameters.principal,
      shadedPointCount: loanParameters.numberOfInterestOnlyTerms,
    }
  }, [loanParameters, comparison])
}

export function useCostChart(
  loanParameters: LoanParameters,
  comparison: RepaymentPlanComparison,
  view: CostChartView,
): ChartContent {
  return useMemo(() => {
    const buildValues =
      view === 'accumulatedInterest'
        ? accumulatedInterestOverTime
        : paymentOverTime

    const pointCount = comparison.totalNumberOfTerms + 1
    const filler = view === 'accumulatedInterest' ? 'lastValue' : 'zero'

    const series: LineChartSeries[] = [
      {
        name: WITHOUT_INTEREST_ONLY_NAME,
        colorVariableName: WITHOUT_INTEREST_ONLY_COLOR,
        values: padToLength(
          buildValues(comparison.planWithoutInterestOnlyPeriod.terms),
          pointCount,
          filler,
        ),
      },
      {
        name: WITH_INTEREST_ONLY_NAME,
        colorVariableName: WITH_INTEREST_ONLY_COLOR,
        values: padToLength(
          buildValues(comparison.planWithInterestOnlyPeriod.terms),
          pointCount,
          filler,
        ),
      },
    ]

    return {
      series,
      maximumValue: roundUpToNiceStep(highestValue(series)),
      shadedPointCount: loanParameters.numberOfInterestOnlyTerms,
    }
  }, [loanParameters, comparison, view])
}
