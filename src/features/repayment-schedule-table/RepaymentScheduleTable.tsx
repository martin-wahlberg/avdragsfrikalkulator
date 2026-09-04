import type { ReactNode } from 'react'
import { Card } from '../ui/card/Card'
import './RepaymentScheduleTable.css'

export interface ScheduleTableRow {
  key: string
  label: string
  badge?: string
  highlighted: boolean
  cells: string[]
}

export interface ScheduleTableTotalRow {
  label: string
  cells: string[]
}

interface RepaymentScheduleTableProps {
  title: string
  description: string
  columnLabels: string[]
  rows: ScheduleTableRow[]
  totalRow: ScheduleTableTotalRow
  controls?: ReactNode
}

export function RepaymentScheduleTable({
  title,
  description,
  columnLabels,
  rows,
  totalRow,
  controls,
}: RepaymentScheduleTableProps) {
  return (
    <Card title={title} description={description} action={controls}>
      <div className="repayment-schedule-table__scroll">
        <table className="repayment-schedule-table__table">
          <thead>
            <tr>
              {columnLabels.map((columnLabel) => (
                <th scope="col" key={columnLabel}>
                  {columnLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={
                  row.highlighted
                    ? 'repayment-schedule-table__row repayment-schedule-table__row--highlighted'
                    : 'repayment-schedule-table__row'
                }
              >
                <th scope="row">
                  {row.label}
                  {row.badge === undefined ? null : (
                    <span className="repayment-schedule-table__badge">
                      {row.badge}
                    </span>
                  )}
                </th>
                {row.cells.map((cell, cellIndex) => (
                  <td key={columnLabels[cellIndex + 1]}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{totalRow.label}</th>
              {totalRow.cells.map((cell, cellIndex) => (
                <td key={columnLabels[cellIndex + 1]}>{cell}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}
