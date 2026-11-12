import type { ReactNode } from 'react'

export interface ScheduleTableSubRow {
  label: string
  cells: string[]
  highlighted?: boolean
}

export interface ScheduleTableRow {
  key: string
  label: string
  subRows: ScheduleTableSubRow[]
}

export interface ScheduleTableTotalRow {
  label: string
  subRows: ScheduleTableSubRow[]
}

export interface RepaymentScheduleTableProps {
  title: string
  description: string
  columnLabels: string[]
  rows: ScheduleTableRow[]
  totalRow: ScheduleTableTotalRow
  controls?: ReactNode
}
