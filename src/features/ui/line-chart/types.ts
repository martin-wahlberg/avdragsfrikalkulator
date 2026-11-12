export interface LineChartSeries {
  name: string
  values: number[]
  colorVariableName: string
}

export interface LineChartProps {
  series: LineChartSeries[]
  maximumValue: number
  pointsBetweenTicks: number
  shadedPointCount?: number
  formatValue: (value: number) => string
  formatAxisValue: (value: number) => string
  formatTickLabel: (pointIndex: number) => string
  formatPointLabel: (pointIndex: number) => string
  ariaLabel: string
}
