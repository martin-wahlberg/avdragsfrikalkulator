import {
  formatCompactNumber,
  formatCurrency,
} from '../formatting/formatting'
import { Card } from '../ui/card/Card'
import { LineChart } from '../ui/line-chart/LineChart'
import type { LoanChartCardProps } from './types'

const MONTHS_PER_TICK = 60
const MONTHS_PER_YEAR = 12

function formatYearTick(pointIndex: number): string {
  return `${pointIndex / MONTHS_PER_YEAR} år`
}

function formatTermLabel(pointIndex: number): string {
  return `Etter termin ${pointIndex}`
}

export function LoanChartCard({
  title,
  description,
  ariaLabel,
  series,
  maximumValue,
  shadedPointCount,
  action,
}: LoanChartCardProps) {
  return (
    <Card title={title} description={description} action={action}>
      <LineChart
        series={series}
        maximumValue={maximumValue}
        shadedPointCount={shadedPointCount}
        pointsBetweenTicks={MONTHS_PER_TICK}
        formatValue={formatCurrency}
        formatAxisValue={formatCompactNumber}
        formatTickLabel={formatYearTick}
        formatPointLabel={formatTermLabel}
        ariaLabel={ariaLabel}
      />
    </Card>
  )
}
