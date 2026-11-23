import {
  formatCurrency,
  formatCurrencyWithDecimals,
  formatPercent,
} from '../formatting/formatting'
import type {
  LoanParameters,
  RepaymentPlanComparison,
} from '../repayment-plan/types'
import type { CalculationExplanations } from './types'

function formatAmount(amount: number): string {
  return Number.isInteger(amount)
    ? formatCurrency(amount)
    : formatCurrencyWithDecimals(amount)
}

function monthlyRate(annualInterestRatePercent: number): string {
  return `(${formatPercent(annualInterestRatePercent)} ÷ 12)`
}

function annuityPayment(
  principal: number,
  annualInterestRatePercent: number,
  numberOfTerms: number,
): string {
  if (annualInterestRatePercent === 0) {
    return `${formatAmount(principal)} ÷ ${numberOfTerms}`
  }

  const rate = monthlyRate(annualInterestRatePercent)

  return `${formatAmount(principal)} × ${rate} ÷ (1 − (1 + ${rate})^−${numberOfTerms})`
}

export function buildCalculationExplanations(
  loanParameters: LoanParameters,
  comparison: RepaymentPlanComparison,
): CalculationExplanations {
  const {
    principal,
    annualInterestRatePercent,
    interestRateAfterInterestOnlyPeriodPercent,
    numberOfTerms,
    extendsTermByInterestOnlyPeriod,
  } = loanParameters
  const {
    effectiveInterestOnlyTerms,
    numberOfTermsWithRepayment,
    debtWhenInterestRateChanges,
  } = comparison

  const termsBeforeRateChange = Math.min(
    effectiveInterestOnlyTerms,
    numberOfTerms,
  )
  const termsAfterRateChange = numberOfTerms - termsBeforeRateChange
  const interestRateStaysTheSame =
    interestRateAfterInterestOnlyPeriodPercent === annualInterestRatePercent

  const paymentWithoutInterestOnlyPeriod = annuityPayment(
    principal,
    annualInterestRatePercent,
    numberOfTerms,
  )
  const paymentDuringInterestOnlyPeriod = `${formatAmount(principal)} × ${formatPercent(annualInterestRatePercent)} ÷ 12`
  const paymentAfterInterestOnlyPeriod = annuityPayment(
    principal,
    interestRateAfterInterestOnlyPeriodPercent,
    numberOfTermsWithRepayment,
  )
  const paymentAfterRateChangeWithoutInterestOnlyPeriod = annuityPayment(
    debtWhenInterestRateChanges,
    interestRateAfterInterestOnlyPeriodPercent,
    termsAfterRateChange,
  )

  const totalCostWithoutInterestOnlyPeriodSum =
    termsBeforeRateChange === 0 ||
    termsAfterRateChange === 0 ||
    interestRateStaysTheSame
      ? `${paymentWithoutInterestOnlyPeriod} × ${numberOfTerms}`
      : `${paymentWithoutInterestOnlyPeriod} × ${termsBeforeRateChange} + ${paymentAfterRateChangeWithoutInterestOnlyPeriod} × ${termsAfterRateChange}`

  const totalCostWithInterestOnlyPeriodSum =
    effectiveInterestOnlyTerms === 0
      ? `${paymentAfterInterestOnlyPeriod} × ${numberOfTermsWithRepayment}`
      : `${paymentDuringInterestOnlyPeriod} × ${effectiveInterestOnlyTerms} + ${paymentAfterInterestOnlyPeriod} × ${numberOfTermsWithRepayment}`

  const equalPaymentRate = comparison.equalPaymentInterestRatePercent
  const equivalentRate = comparison.equivalentInterestRatePercent

  return {
    additionalCost: `(${totalCostWithInterestOnlyPeriodSum}) − (${totalCostWithoutInterestOnlyPeriodSum}) = ${formatAmount(comparison.additionalCostOfInterestOnlyPeriod)}`,
    paymentWithoutInterestOnlyPeriod: `${paymentWithoutInterestOnlyPeriod} = ${formatAmount(comparison.paymentWithoutInterestOnlyPeriod)}`,
    paymentDuringInterestOnlyPeriod: `${paymentDuringInterestOnlyPeriod} = ${formatAmount(comparison.paymentDuringInterestOnlyPeriod)}`,
    paymentAfterInterestOnlyPeriod: `${paymentAfterInterestOnlyPeriod} = ${formatAmount(comparison.paymentAfterInterestOnlyPeriod)}`,
    paymentAfterRateChangeWithoutInterestOnlyPeriod:
      termsAfterRateChange === 0
        ? undefined
        : `${paymentAfterRateChangeWithoutInterestOnlyPeriod} = ${formatAmount(comparison.paymentAfterRateChangeWithoutInterestOnlyPeriod)}`,
    totalCostWithoutInterestOnlyPeriod: `${totalCostWithoutInterestOnlyPeriodSum} = ${formatAmount(comparison.planWithoutInterestOnlyPeriod.totalCost)}`,
    totalCostWithInterestOnlyPeriod: `${totalCostWithInterestOnlyPeriodSum} = ${formatAmount(comparison.planWithInterestOnlyPeriod.totalCost)}`,
    equalPaymentInterestRate:
      equalPaymentRate === null
        ? undefined
        : `${annuityPayment(principal, equalPaymentRate, numberOfTermsWithRepayment)} = ${formatAmount(comparison.paymentWithoutInterestOnlyPeriod)}`,
    equivalentInterestRate:
      equivalentRate === null
        ? undefined
        : `${annuityPayment(principal, equivalentRate, numberOfTerms)} × ${numberOfTerms} − ${formatAmount(principal)} = ${formatAmount(comparison.planWithInterestOnlyPeriod.totalInterestCost)}`,
    termsWithRepayment: extendsTermByInterestOnlyPeriod
      ? undefined
      : `${numberOfTerms} − ${effectiveInterestOnlyTerms} = ${numberOfTermsWithRepayment}`,
  }
}
