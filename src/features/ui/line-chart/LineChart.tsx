import { useState } from 'react'
import type { PointerEvent } from 'react'
import './LineChart.css'

const CHART_WIDTH = 860
const CHART_HEIGHT = 380
const MARGIN_LEFT = 72
const MARGIN_RIGHT = 20
const MARGIN_TOP = 16
const MARGIN_BOTTOM = 44
const PLOT_WIDTH = CHART_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM
const NUMBER_OF_HORIZONTAL_GRIDLINES = 4

export interface LineChartSeries {
  name: string
  values: number[]
  colorVariableName: string
}

interface LineChartProps {
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

export function LineChart({
  series,
  maximumValue,
  pointsBetweenTicks,
  shadedPointCount = 0,
  formatValue,
  formatAxisValue,
  formatTickLabel,
  formatPointLabel,
  ariaLabel,
}: LineChartProps) {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null)

  const lastPointIndex = Math.max(series[0].values.length - 1, 1)
  const verticalScale = maximumValue === 0 ? 1 : maximumValue

  function horizontalPositionFor(pointIndex: number): number {
    return MARGIN_LEFT + (pointIndex / lastPointIndex) * PLOT_WIDTH
  }

  function verticalPositionFor(value: number): number {
    return MARGIN_TOP + (1 - value / verticalScale) * PLOT_HEIGHT
  }

  function buildLinePath(values: number[]): string {
    return values
      .map(
        (value, pointIndex) =>
          `${pointIndex === 0 ? 'M' : 'L'} ${horizontalPositionFor(pointIndex).toFixed(2)} ${verticalPositionFor(value).toFixed(2)}`,
      )
      .join(' ')
  }

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratioAcrossPlot = (event.clientX - bounds.left) / bounds.width
    const nearestPointIndex = Math.round(ratioAcrossPlot * lastPointIndex)

    setHoveredPointIndex(
      Math.min(Math.max(nearestPointIndex, 0), lastPointIndex),
    )
  }

  const gridlineValues = Array.from(
    { length: NUMBER_OF_HORIZONTAL_GRIDLINES + 1 },
    (_unused, index) => (verticalScale / NUMBER_OF_HORIZONTAL_GRIDLINES) * index,
  )

  const tickPointIndexes = Array.from(
    { length: Math.floor(lastPointIndex / pointsBetweenTicks) + 1 },
    (_unused, index) => index * pointsBetweenTicks,
  )

  return (
    <div className="line-chart">
      <ul className="line-chart__legend">
        {series.map((oneSeries) => (
          <li className="line-chart__legend-item" key={oneSeries.name}>
            <span
              className="line-chart__swatch"
              style={{ background: `var(${oneSeries.colorVariableName})` }}
            />
            {oneSeries.name}
          </li>
        ))}
      </ul>

      <div className="line-chart__plot">
        <svg
          className="line-chart__svg"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={ariaLabel}
        >
          {shadedPointCount > 0 ? (
            <rect
              className="line-chart__band"
              x={MARGIN_LEFT}
              y={MARGIN_TOP}
              width={horizontalPositionFor(shadedPointCount) - MARGIN_LEFT}
              height={PLOT_HEIGHT}
            />
          ) : null}

          {gridlineValues.map((gridlineValue) => (
            <g key={gridlineValue}>
              <line
                className="line-chart__gridline"
                x1={MARGIN_LEFT}
                x2={MARGIN_LEFT + PLOT_WIDTH}
                y1={verticalPositionFor(gridlineValue)}
                y2={verticalPositionFor(gridlineValue)}
              />
              <text
                className="line-chart__axis-label line-chart__axis-label--vertical"
                x={MARGIN_LEFT - 12}
                y={verticalPositionFor(gridlineValue) + 4}
              >
                {formatAxisValue(gridlineValue)}
              </text>
            </g>
          ))}

          {tickPointIndexes.map((pointIndex) => (
            <text
              key={pointIndex}
              className="line-chart__axis-label"
              x={horizontalPositionFor(pointIndex)}
              y={MARGIN_TOP + PLOT_HEIGHT + 24}
              textAnchor="middle"
            >
              {formatTickLabel(pointIndex)}
            </text>
          ))}

          <line
            className="line-chart__baseline"
            x1={MARGIN_LEFT}
            x2={MARGIN_LEFT + PLOT_WIDTH}
            y1={MARGIN_TOP + PLOT_HEIGHT}
            y2={MARGIN_TOP + PLOT_HEIGHT}
          />

          {series.map((oneSeries) => (
            <path
              key={oneSeries.name}
              className="line-chart__line"
              style={{ stroke: `var(${oneSeries.colorVariableName})` }}
              d={buildLinePath(oneSeries.values)}
            />
          ))}

          {hoveredPointIndex === null ? null : (
            <g>
              <line
                className="line-chart__crosshair"
                x1={horizontalPositionFor(hoveredPointIndex)}
                x2={horizontalPositionFor(hoveredPointIndex)}
                y1={MARGIN_TOP}
                y2={MARGIN_TOP + PLOT_HEIGHT}
              />
              {series.map((oneSeries) => (
                <circle
                  key={oneSeries.name}
                  className="line-chart__marker"
                  style={{ fill: `var(${oneSeries.colorVariableName})` }}
                  cx={horizontalPositionFor(hoveredPointIndex)}
                  cy={verticalPositionFor(oneSeries.values[hoveredPointIndex])}
                  r={5}
                />
              ))}
            </g>
          )}

          <rect
            className="line-chart__hover-target"
            x={MARGIN_LEFT}
            y={MARGIN_TOP}
            width={PLOT_WIDTH}
            height={PLOT_HEIGHT}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoveredPointIndex(null)}
          />
        </svg>

        {hoveredPointIndex === null ? null : (
          <div
            className="line-chart__tooltip"
            style={{
              left: `${(horizontalPositionFor(hoveredPointIndex) / CHART_WIDTH) * 100}%`,
            }}
          >
            <p className="line-chart__tooltip-title">
              {formatPointLabel(hoveredPointIndex)}
            </p>
            {series.map((oneSeries) => (
              <p className="line-chart__tooltip-row" key={oneSeries.name}>
                <span
                  className="line-chart__swatch"
                  style={{ background: `var(${oneSeries.colorVariableName})` }}
                />
                {formatValue(oneSeries.values[hoveredPointIndex])}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
