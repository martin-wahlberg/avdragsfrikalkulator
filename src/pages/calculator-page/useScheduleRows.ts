import { useMemo } from 'react'
import type {
  ScheduleTableRow,
  ScheduleTableTotalRow,
} from '../../features/repayment-schedule-table/RepaymentScheduleTable'
import type {
  RepaymentPlan,
  Term,
} from '../../features/repayment-plan/types'
import {
  formatCurrencyWithDecimals,
  formatInteger,
} from '../../lib/formatting'

export const SCHEDULE_GROUPINGS = ['perMonth', 'perYear'] as const

export type ScheduleGrouping = (typeof SCHEDULE_GROUPINGS)[number]

export interface ScheduleContent {
  columnLabels: string[]
  rows: ScheduleTableRow[]
  totalRow: ScheduleTableTotalRow
}

function buildRowsPerMonth(terms: Term[]): ScheduleTableRow[] {
  return terms.map((term) => ({
    key: `month-${term.termNumber}`,
    label: formatInteger(term.termNumber),
    badge: term.isInterestOnly ? 'avdragsfri' : undefined,
    highlighted: term.isInterestOnly,
    cells: [
      formatCurrencyWithDecimals(term.payment),
      formatCurrencyWithDecimals(term.interest),
      formatCurrencyWithDecimals(term.principalRepayment),
      formatCurrencyWithDecimals(term.remainingDebt),
    ],
  }))
}

function buildRowsPerYear(terms: Term[]): ScheduleTableRow[] {
  const rows: ScheduleTableRow[] = []

  for (let startIndex = 0; startIndex < terms.length; startIndex += 12) {
    const termsInYear = terms.slice(startIndex, startIndex + 12)
    const yearNumber = startIndex / 12 + 1
    const lastTermInYear = termsInYear[termsInYear.length - 1]
    const isInterestOnly = termsInYear.every((term) => term.isInterestOnly)

    rows.push({
      key: `year-${yearNumber}`,
      label: `År ${yearNumber}`,
      badge: isInterestOnly ? 'avdragsfri' : undefined,
      highlighted: isInterestOnly,
      cells: [
        formatCurrencyWithDecimals(
          termsInYear.reduce((sum, term) => sum + term.payment, 0),
        ),
        formatCurrencyWithDecimals(
          termsInYear.reduce((sum, term) => sum + term.interest, 0),
        ),
        formatCurrencyWithDecimals(
          termsInYear.reduce((sum, term) => sum + term.principalRepayment, 0),
        ),
        formatCurrencyWithDecimals(lastTermInYear.remainingDebt),
      ],
    })
  }

  return rows
}

export function useScheduleRows(
  plan: RepaymentPlan,
  grouping: ScheduleGrouping,
): ScheduleContent {
  return useMemo(
    () => ({
      columnLabels: [
        grouping === 'perYear' ? 'År' : 'Måned',
        'Terminbeløp',
        'Renter',
        'Avdrag',
        'Restgjeld',
      ],
      rows:
        grouping === 'perYear'
          ? buildRowsPerYear(plan.terms)
          : buildRowsPerMonth(plan.terms),
      totalRow: {
        label: 'Sum',
        cells: [
          formatCurrencyWithDecimals(plan.totalCost),
          formatCurrencyWithDecimals(plan.totalInterestCost),
          formatCurrencyWithDecimals(
            plan.totalCost - plan.totalInterestCost,
          ),
          '',
        ],
      },
    }),
    [plan, grouping],
  )
}
