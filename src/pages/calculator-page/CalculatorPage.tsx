import { useState } from 'react'
import { KeyFigures } from '../../features/key-figures/KeyFigures'
import { LoanForm } from '../../features/loan-form/LoanForm'
import { useRepaymentPlan } from '../../features/repayment-plan/useRepaymentPlan'
import { RepaymentScheduleTable } from '../../features/repayment-schedule-table/RepaymentScheduleTable'
import { Card } from '../../features/ui/card/Card'
import { LineChart } from '../../features/ui/line-chart/LineChart'
import { SegmentedControl } from '../../features/ui/segmented-control/SegmentedControl'
import {
  formatCompactNumber,
  formatCurrency,
  formatTermsAsYearsAndMonths,
} from '../../lib/formatting'
import { useCostChart, useRemainingDebtChart } from './useChartSeries'
import type { CostChartView } from './useChartSeries'
import { useKeyFigures } from './useKeyFigures'
import { useScheduleRows } from './useScheduleRows'
import type { ScheduleGrouping } from './useScheduleRows'
import './CalculatorPage.css'

const MONTHS_PER_TICK = 60

const COST_VIEW_OPTIONS = [
  { value: 'accumulatedInterest', label: 'Akkumulerte renter' },
  { value: 'payment', label: 'Terminbeløp' },
] as const

const PLAN_OPTIONS = [
  { value: 'withInterestOnly', label: 'Med avdragsfrihet' },
  { value: 'withoutInterestOnly', label: 'Uten avdragsfrihet' },
] as const

const GROUPING_OPTIONS = [
  { value: 'perMonth', label: 'Per måned' },
  { value: 'perYear', label: 'Per år' },
] as const

type PlanChoice = (typeof PLAN_OPTIONS)[number]['value']

function formatYearTick(pointIndex: number): string {
  return `${pointIndex / 12} år`
}

function formatTermLabel(pointIndex: number): string {
  return `Etter termin ${pointIndex}`
}

export function CalculatorPage() {
  const {
    loanParameters,
    comparison,
    setPrincipal,
    setAnnualInterestRatePercent,
    setNumberOfTerms,
    setNumberOfInterestOnlyTerms,
    resetToDefaults,
  } = useRepaymentPlan()

  const [costView, setCostView] = useState<CostChartView>('accumulatedInterest')
  const [selectedPlan, setSelectedPlan] =
    useState<PlanChoice>('withInterestOnly')
  const [grouping, setGrouping] = useState<ScheduleGrouping>('perMonth')

  const keyFigures = useKeyFigures(loanParameters, comparison)
  const remainingDebtChart = useRemainingDebtChart(loanParameters, comparison)
  const costChart = useCostChart(loanParameters, comparison, costView)
  const schedule = useScheduleRows(
    selectedPlan === 'withInterestOnly'
      ? comparison.planWithInterestOnlyPeriod
      : comparison.planWithoutInterestOnlyPeriod,
    grouping,
  )

  const interestOnlyDescription =
    loanParameters.numberOfInterestOnlyTerms > 0
      ? `Det skraverte feltet er de ${formatTermsAsYearsAndMonths(loanParameters.numberOfInterestOnlyTerms)} med avdragsfrihet.`
      : 'Uten avdragsfrie terminer er de to planene identiske.'

  return (
    <div className="calculator-page">
      <header className="calculator-page__header">
        <h1 className="calculator-page__title">Avdragsfrikalkulator</h1>
        <p className="calculator-page__subtitle">
          Sammenlign terminbeløp, restgjeld og samlet rentekostnad med og uten
          avdragsfrihet.
        </p>
      </header>

      <main className="calculator-page__layout">
        <aside className="calculator-page__sidebar">
          <LoanForm
            principal={loanParameters.principal}
            annualInterestRatePercent={loanParameters.annualInterestRatePercent}
            numberOfTerms={loanParameters.numberOfTerms}
            numberOfInterestOnlyTerms={
              loanParameters.numberOfInterestOnlyTerms
            }
            onPrincipalChange={setPrincipal}
            onAnnualInterestRatePercentChange={setAnnualInterestRatePercent}
            onNumberOfTermsChange={setNumberOfTerms}
            onNumberOfInterestOnlyTermsChange={setNumberOfInterestOnlyTerms}
            onReset={resetToDefaults}
          />
        </aside>

        <div className="calculator-page__content">
          <KeyFigures
            headline={keyFigures.headline}
            figures={keyFigures.figures}
          />

          <Card
            title="Restgjeld gjennom løpetiden"
            description={`Med avdragsfrihet står gjelden stille, og må hentes inn igjen på færre terminer. ${interestOnlyDescription}`}
          >
            <LineChart
              series={remainingDebtChart.series}
              maximumValue={remainingDebtChart.maximumValue}
              shadedPointCount={remainingDebtChart.shadedPointCount}
              pointsBetweenTicks={MONTHS_PER_TICK}
              formatValue={formatCurrency}
              formatAxisValue={formatCompactNumber}
              formatTickLabel={formatYearTick}
              formatPointLabel={formatTermLabel}
              ariaLabel="Linjediagram over restgjeld med og uten avdragsfrihet gjennom hele løpetiden"
            />
          </Card>

          <Card
            title="Kostnader gjennom løpetiden"
            description={
              costView === 'accumulatedInterest'
                ? 'Summen av alt du har betalt i renter så langt. Avstanden mellom linjene på slutten er merkostnaden ved avdragsfrihet.'
                : 'Hva du betaler hver måned. Med avdragsfrihet betaler du mindre i starten og mer resten av løpetiden.'
            }
            action={
              <SegmentedControl
                options={COST_VIEW_OPTIONS}
                selectedValue={costView}
                ariaLabel="Velg hva kostnadsgrafen viser"
                onChange={setCostView}
              />
            }
          >
            <LineChart
              series={costChart.series}
              maximumValue={costChart.maximumValue}
              shadedPointCount={costChart.shadedPointCount}
              pointsBetweenTicks={MONTHS_PER_TICK}
              formatValue={formatCurrency}
              formatAxisValue={formatCompactNumber}
              formatTickLabel={formatYearTick}
              formatPointLabel={formatTermLabel}
              ariaLabel={
                costView === 'accumulatedInterest'
                  ? 'Linjediagram over akkumulerte renter med og uten avdragsfrihet'
                  : 'Linjediagram over terminbeløp med og uten avdragsfrihet'
              }
            />
          </Card>

          <RepaymentScheduleTable
            title="Nedbetalingsplan"
            description="Avdragsfrie terminer er markert. Tallene er avrundet til øre, slik som i regnearket."
            columnLabels={schedule.columnLabels}
            rows={schedule.rows}
            totalRow={schedule.totalRow}
            controls={
              <div className="calculator-page__table-controls">
                <SegmentedControl
                  options={PLAN_OPTIONS}
                  selectedValue={selectedPlan}
                  ariaLabel="Velg hvilken plan tabellen viser"
                  onChange={setSelectedPlan}
                />
                <SegmentedControl
                  options={GROUPING_OPTIONS}
                  selectedValue={grouping}
                  ariaLabel="Velg oppløsning i tabellen"
                  onChange={setGrouping}
                />
              </div>
            }
          />
        </div>
      </main>

      <footer className="calculator-page__footer">
        <p>
          Annuitetslån med nominell rente og månedlige terminer. Gebyrer og
          renteendringer er ikke tatt med.
        </p>
      </footer>
    </div>
  )
}
