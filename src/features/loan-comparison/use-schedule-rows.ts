import { useMemo } from 'react'
import {
  formatCurrencyWithDecimals,
  formatInteger,
} from '../formatting/formatting'
import type { RepaymentPlan, Term } from '../repayment-plan/types'
import type {
  ScheduleTableRow,
  ScheduleTableSubRow,
} from '../repayment-schedule-table/types'
import type { ScheduleContent, ScheduleGrouping } from './types'

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

const NOT_APPLICABLE_CELLS = ['', '', '', '']

/**
 * Nar avdragsfriheten legges til lopetiden er planene ulikt lange, sa den som
 * allerede er nedbetalt har ingen rad igjen a vise.
 */
function comparedSubRows(
  termFromStart: Term | undefined,
  termWithInterestOnly: Term | undefined,
): ScheduleTableSubRow[] {
  return [
    {
      label: FROM_START_LABEL,
      cells:
        termFromStart === undefined
          ? NOT_APPLICABLE_CELLS
          : termToCells(termFromStart),
    },
    {
      label:
        termWithInterestOnly === undefined
          ? AFTER_INTEREST_ONLY_LABEL
          : termWithInterestOnly.isInterestOnly
            ? INTEREST_ONLY_LABEL
            : AFTER_INTEREST_ONLY_LABEL,
      cells:
        termWithInterestOnly === undefined
          ? NOT_APPLICABLE_CELLS
          : termToCells(termWithInterestOnly),
      highlighted: termWithInterestOnly?.isInterestOnly === true,
    },
  ]
}

function buildRowsPerMonth(
  termsFromStart: Term[],
  termsWithInterestOnly: Term[],
): ScheduleTableRow[] {
  const termCount = Math.max(
    termsFromStart.length,
    termsWithInterestOnly.length,
  )

  return Array.from({ length: termCount }, (_unused, index) => ({
    key: `month-${index + 1}`,
    label: formatInteger(index + 1),
    subRows: comparedSubRows(
      termsFromStart[index],
      termsWithInterestOnly[index],
    ),
  }))
}

function sumOverYear(terms: Term[], startIndex: number): Term | undefined {
  const termsInYear = terms.slice(startIndex, startIndex + 12)
  const lastTermInYear = termsInYear[termsInYear.length - 1]

  if (lastTermInYear === undefined) {
    return undefined
  }

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

  const termCount = Math.max(
    termsFromStart.length,
    termsWithInterestOnly.length,
  )

  for (let startIndex = 0; startIndex < termCount; startIndex += 12) {
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
