import type { KeyFigure, KeyFigureHeadline } from '../key-figures/types'
import type {
  ScheduleTableRow,
  ScheduleTableTotalRow,
} from '../repayment-schedule-table/types'
import type { LineChartSeries } from '../ui/line-chart/types'

export type CostChartView = 'accumulatedInterest' | 'payment'

export type ScheduleGrouping = 'perMonth' | 'perYear'

export interface ChartContent {
  series: LineChartSeries[]
  maximumValue: number
  shadedPointCount: number
}

export interface KeyFigureContent {
  headline: KeyFigureHeadline
  figures: KeyFigure[]
}

export interface ScheduleContent {
  columnLabels: string[]
  rows: ScheduleTableRow[]
  totalRow: ScheduleTableTotalRow
}
