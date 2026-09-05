import { useMemo } from 'react'
import type {
  ScheduleTableRow,
  ScheduleTableSubRow,
  ScheduleTableTotalRow,
} from '../repayment-schedule-table/RepaymentScheduleTable'
import type {
  RepaymentPlan,
  Term,
} from '../repayment-plan/types'
import {
  formatCurrencyWithDecimals,
  formatInteger,
} from '../formatting/formatting'

export const SCHEDULE_GROUPINGS = ['perMonth', 'perYear'] as const

export type ScheduleGrouping = (typeof SCHEDULE_GROUPINGS)[number]

export interface ScheduleContent {
  columnLabels: string[]
  rows: ScheduleTableRow[]
  totalRow: ScheduleTableTotalRow
}

const FROM_START_LABEL = 'Nedbetaling fra start'
const INTEREST_ONLY_LABEL = 'Avdragsfrihet'
const AFTER_INTEREST_ONLY_LABEL = 'Nedbetaling etter avdragsfri periode'

function termToCells(term: Term): string[] {
  return [
    formatCurrencyWithDecimals(term.payment),
    formatCurrencyWithDecimals(term.interest),
    formatCurrencyWithDecimals(term.principalRepayment),
    formatCurrencyWithDecimals(term.remainingDebt),
  ]
}

function comparedSubRows(
  termFromStart: Term,
  termWithInterestOnly: Term,
): ScheduleTableSubRow[] {
  return [
    { label: FROM_START_LABEL, cells: termToCells(termFromStart) },
    {
      label: termWithInterestOnly.isInterestOnly
        ? INTEREST_ONLY_LABEL
        : AFTER_INTEREST_ONLY_LABEL,
      cells: termToCells(termWithInterestOnly),
      highlighted: termWithInterestOnly.isInterestOnly,
    },
  ]
}

function buildRowsPerMonth(
  termsFromStart: Term[],
  termsWithInterestOnly: Term[],
): ScheduleTableRow[] {
  return termsFromStart.map((termFromStart, index) => {
    const termWithInterestOnly = termsWithInterestOnly[index]

    return {
      key: `month-${termFromStart.termNumber}`,
      label: formatInteger(termFromStart.termNumber),
      subRows: comparedSubRows(termFromStart, termWithInterestOnly),
    }
  })
}

function sumOverYear(terms: Term[], startIndex: number): Term {
  const termsInYear = terms.slice(startIndex, startIndex + 12)
  const lastTermInYear = termsInYear[termsInYear.length - 1]

  return {
    termNumber: lastTermInYear.termNumber,
    payment: termsInYear.reduce((sum, term) => sum + term.payment, 0),
    interest: termsInYear.reduce((sum, term) => sum + term.interest, 0),
    principalRepayment: termsInYear.reduce(
      (sum, term) => sum + term.principalRepayment,
      0,
    ),
    remainingDebt: lastTermInYear.remainingDebt,
    isInterestOnly: termsInYear.every((term) => term.isInterestOnly),
  }
}

function buildRowsPerYear(
  termsFromStart: Term[],
  termsWithInterestOnly: Term[],
): ScheduleTableRow[] {
  const rows: ScheduleTableRow[] = []

  for (
    let startIndex = 0;
    startIndex < termsFromStart.length;
    startIndex += 12
  ) {
    const yearNumber = startIndex / 12 + 1
    const yearFromStart = sumOverYear(termsFromStart, startIndex)
    const yearWithInterestOnly = sumOverYear(termsWithInterestOnly, startIndex)

    rows.push({
      key: `year-${yearNumber}`,
      label: `År ${yearNumber}`,
      subRows: comparedSubRows(yearFromStart, yearWithInterestOnly),
    })
  }

  return rows
}

function planToTotalCells(plan: RepaymentPlan): string[] {
  return [
    formatCurrencyWithDecimals(plan.totalCost),
    formatCurrencyWithDecimals(plan.totalInterestCost),
    formatCurrencyWithDecimals(plan.totalCost - plan.totalInterestCost),
    '',
  ]
}

export function useScheduleRows(
  planFromStart: RepaymentPlan,
  planWithInterestOnly: RepaymentPlan,
  grouping: ScheduleGrouping,
): ScheduleContent {
  return useMemo(
    () => ({
      columnLabels: [
        grouping === 'perYear' ? 'År' : 'Måned',
        'Betalingsmåte',
        'Terminbeløp',
        'Renter',
        'Avdrag',
        'Restgjeld',
      ],
      rows:
        grouping === 'perYear'
          ? buildRowsPerYear(planFromStart.terms, planWithInterestOnly.terms)
          : buildRowsPerMonth(planFromStart.terms, planWithInterestOnly.terms),
      totalRow: {
        label: 'Sum',
        subRows: [
          { label: FROM_START_LABEL, cells: planToTotalCells(planFromStart) },
          {
            label: INTEREST_ONLY_LABEL,
            cells: planToTotalCells(planWithInterestOnly),
          },
        ],
      },
    }),
    [planFromStart, planWithInterestOnly, grouping],
  )
}
