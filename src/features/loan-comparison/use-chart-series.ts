import { useMemo } from 'react'
import type { LineChartSeries } from '../ui/line-chart/LineChart'
import type {
  LoanParameters,
  RepaymentPlanComparison,
  Term,
} from '../repayment-plan/types'

const WITHOUT_INTEREST_ONLY_COLOR = '--series-without-interest-only'
const WITH_INTEREST_ONLY_COLOR = '--series-with-interest-only'
const WITHOUT_INTEREST_ONLY_NAME = 'Uten avdragsfrihet'
const WITH_INTEREST_ONLY_NAME = 'Med avdragsfrihet'

export const COST_CHART_VIEWS = ['accumulatedInterest', 'payment'] as const

export type CostChartView = (typeof COST_CHART_VIEWS)[number]

export interface ChartContent {
  series: LineChartSeries[]
  maximumValue: number
  shadedPointCount: number
}

function roundUpToNiceStep(value: number): number {
  if (value <= 0) {
    return 1
  }

  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const step = magnitude / 2

  return Math.ceil(value / step) * step
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
  return useMemo(
    () => ({
      series: [
        {
          name: WITHOUT_INTEREST_ONLY_NAME,
          colorVariableName: WITHOUT_INTEREST_ONLY_COLOR,
          values: remainingDebtOverTime(
            loanParameters.principal,
            comparison.planWithoutInterestOnlyPeriod.terms,
          ),
        },
        {
          name: WITH_INTEREST_ONLY_NAME,
          colorVariableName: WITH_INTEREST_ONLY_COLOR,
          values: remainingDebtOverTime(
            loanParameters.principal,
            comparison.planWithInterestOnlyPeriod.terms,
          ),
        },
      ],
      maximumValue: loanParameters.principal,
      shadedPointCount: loanParameters.numberOfInterestOnlyTerms,
    }),
    [loanParameters, comparison],
  )
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

    const series: LineChartSeries[] = [
      {
        name: WITHOUT_INTEREST_ONLY_NAME,
        colorVariableName: WITHOUT_INTEREST_ONLY_COLOR,
        values: buildValues(comparison.planWithoutInterestOnlyPeriod.terms),
      },
      {
        name: WITH_INTEREST_ONLY_NAME,
        colorVariableName: WITH_INTEREST_ONLY_COLOR,
        values: buildValues(comparison.planWithInterestOnlyPeriod.terms),
      },
    ]

    return {
      series,
      maximumValue: roundUpToNiceStep(highestValue(series)),
      shadedPointCount: loanParameters.numberOfInterestOnlyTerms,
    }
  }, [loanParameters, comparison, view])
}
