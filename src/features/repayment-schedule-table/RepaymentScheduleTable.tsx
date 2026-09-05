import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Card } from '../ui/card/Card'
import './RepaymentScheduleTable.css'

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

          {rows.map((row) => (
            <tbody className="repayment-schedule-table__group" key={row.key}>
              {row.subRows.map((subRow, subRowIndex) => (
                <tr
                  key={subRow.label}
                  className={
                    subRow.highlighted === true
                      ? 'repayment-schedule-table__subrow repayment-schedule-table__subrow--highlighted'
                      : 'repayment-schedule-table__subrow'
                  }
                >
                  {subRowIndex === 0 ? (
                    <th scope="rowgroup" rowSpan={row.subRows.length}>
                      {row.label}
                    </th>
                  ) : null}

                  <td className="repayment-schedule-table__plan">
                    {subRow.label}
                  </td>

                  {subRow.cells.map((cell, cellIndex) => (
                    <Fragment key={columnLabels[cellIndex + 2]}>
                      <td>{cell}</td>
                    </Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}

          <tfoot>
            {totalRow.subRows.map((subRow, subRowIndex) => (
              <tr key={subRow.label}>
                {subRowIndex === 0 ? (
                  <th scope="rowgroup" rowSpan={totalRow.subRows.length}>
                    {totalRow.label}
                  </th>
                ) : null}

                <td className="repayment-schedule-table__plan">
                  {subRow.label}
                </td>

                {subRow.cells.map((cell, cellIndex) => (
                  <Fragment key={columnLabels[cellIndex + 2]}>
                    <td>{cell}</td>
                  </Fragment>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
    </Card>
  )
}
