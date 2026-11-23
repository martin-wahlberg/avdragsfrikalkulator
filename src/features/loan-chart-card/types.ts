import type { ReactNode } from 'react'
import type { LineChartSeries } from '../ui/line-chart/types'

export interface LoanChartCardProps {
  title: string
  description: string
  ariaLabel: string
  series: LineChartSeries[]
  maximumValue: number
  shadedPointCount: number
  action?: ReactNode
}
