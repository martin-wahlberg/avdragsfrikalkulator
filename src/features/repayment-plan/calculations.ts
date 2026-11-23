import { calculateMonthlyInterestRate, calculatePayment } from './annuity'
import { findEqualPaymentInterestRatePercent } from './equal-payment-rate'
import { findEquivalentInterestRatePercent } from './equivalent-rate'
import { countTerms } from './term-counts'
import type {
  LoanParameters,
  RepaymentPlan,
  RepaymentPlanComparison,
  Term,
} from './types'

function summarizeTerms(terms: Term[]): RepaymentPlan {
  let totalCost = 0
  let totalInterestCost = 0

  for (const term of terms) {
    totalCost += term.payment
    totalInterestCost += term.interest
  }

  return { terms, totalCost, totalInterestCost }
}

/**
 * Lanet slik det ser ut uten avdragsfrihet. Dette er sammenligningsgrunnlaget
 * i begge modusene, sa det bruker alltid lopetiden du skrev inn.
 */
export function calculatePlanWithoutInterestOnlyPeriod(
  loanParameters: LoanParameters,
): RepaymentPlan {
  const {
    principal,
    annualInterestRatePercent,
    interestRateAfterInterestOnlyPeriodPercent,
    numberOfTerms,
  } = loanParameters
  const { numberOfInterestOnlyTerms } = countTerms(loanParameters)
  const rateBeforeChange = calculateMonthlyInterestRate(
    annualInterestRatePercent,
  )
  const rateAfterChange = calculateMonthlyInterestRate(
    interestRateAfterInterestOnlyPeriodPercent,
  )
  const paymentBeforeChange = calculatePayment(
    rateBeforeChange,
    numberOfTerms,
    principal,
  )
  const termsBeforeRateChange = Math.min(
    numberOfInterestOnlyTerms,
    numberOfTerms,
  )

  const terms: Term[] = []
  let remainingDebt = principal

  for (
    let termNumber = 1;
    termNumber <= termsBeforeRateChange;
    termNumber += 1
  ) {
    const interest = remainingDebt * rateBeforeChange
    const principalRepayment = paymentBeforeChange - interest
    remainingDebt -= principalRepayment

    terms.push({
      termNumber,
      payment: paymentBeforeChange,
      interest,
      principalRepayment,
      remainingDebt,
      isInterestOnly: false,
    })
  }

  const paymentAfterChange = calculatePayment(
    rateAfterChange,
    numberOfTerms - termsBeforeRateChange,
    remainingDebt,
  )

  for (
    let termNumber = termsBeforeRateChange + 1;
    termNumber <= numberOfTerms;
    termNumber += 1
  ) {
    const interest = remainingDebt * rateAfterChange
    const principalRepayment = paymentAfterChange - interest
    remainingDebt -= principalRepayment

    terms.push({
      termNumber,
      payment: paymentAfterChange,
      interest,
      principalRepayment,
      remainingDebt,
      isInterestOnly: false,
    })
  }

  return summarizeTerms(terms)
}

export function calculatePlanWithInterestOnlyPeriod(
  loanParameters: LoanParameters,
): RepaymentPlan {
  const {
    principal,
    annualInterestRatePercent,
    interestRateAfterInterestOnlyPeriodPercent,
  } = loanParameters
  const {
    numberOfInterestOnlyTerms,
    numberOfTermsWithRepayment,
    totalNumberOfTerms,
  } = countTerms(loanParameters)

  const rateBeforeChange = calculateMonthlyInterestRate(
    annualInterestRatePercent,
  )
  const rateAfterChange = calculateMonthlyInterestRate(
    interestRateAfterInterestOnlyPeriodPercent,
  )
  const paymentAfterChange = calculatePayment(
    rateAfterChange,
    numberOfTermsWithRepayment,
    principal,
  )

  const terms: Term[] = []
  let remainingDebt = principal

  for (let termNumber = 1; termNumber <= totalNumberOfTerms; termNumber += 1) {
    const isInterestOnly = termNumber <= numberOfInterestOnlyTerms
    const interest =
      remainingDebt * (isInterestOnly ? rateBeforeChange : rateAfterChange)
    const principalRepayment = isInterestOnly
      ? 0
      : paymentAfterChange - interest
    remainingDebt -= principalRepayment

    terms.push({
      termNumber,
      payment: interest + principalRepayment,
      interest,
      principalRepayment,
      remainingDebt,
      isInterestOnly,
    })
  }

  return summarizeTerms(terms)
}

export function compareRepaymentPlans(
  loanParameters: LoanParameters,
): RepaymentPlanComparison {
  const {
    principal,
    annualInterestRatePercent,
    interestRateAfterInterestOnlyPeriodPercent,
    numberOfTerms,
  } = loanParameters
  const {
    numberOfInterestOnlyTerms,
    numberOfTermsWithRepayment,
    totalNumberOfTerms,
  } = countTerms(loanParameters)

  const rateBeforeChange = calculateMonthlyInterestRate(
    annualInterestRatePercent,
  )
  const rateAfterChange = calculateMonthlyInterestRate(
    interestRateAfterInterestOnlyPeriodPercent,
  )

  const planWithoutInterestOnlyPeriod =
    calculatePlanWithoutInterestOnlyPeriod(loanParameters)
  const planWithInterestOnlyPeriod =
    calculatePlanWithInterestOnlyPeriod(loanParameters)

  const paymentWithoutInterestOnlyPeriod = calculatePayment(
    rateBeforeChange,
    numberOfTerms,
    principal,
  )
  const paymentDuringInterestOnlyPeriod = principal * rateBeforeChange
  const paymentAfterInterestOnlyPeriod = calculatePayment(
    rateAfterChange,
    numberOfTermsWithRepayment,
    principal,
  )

  const termsBeforeRateChange = Math.min(
    numberOfInterestOnlyTerms,
    numberOfTerms,
  )
  const debtWhenRateChanges =
    termsBeforeRateChange === 0
      ? principal
      : planWithoutInterestOnlyPeriod.terms[termsBeforeRateChange - 1]
          .remainingDebt
  const paymentAfterRateChangeWithoutInterestOnlyPeriod = calculatePayment(
    rateAfterChange,
    numberOfTerms - termsBeforeRateChange,
    debtWhenRateChanges,
  )

  return {
    planWithoutInterestOnlyPeriod,
    planWithInterestOnlyPeriod,
    paymentWithoutInterestOnlyPeriod,
    paymentDuringInterestOnlyPeriod,
    paymentAfterInterestOnlyPeriod,
    paymentAfterRateChangeWithoutInterestOnlyPeriod,
    monthlySavingDuringInterestOnlyPeriod:
      paymentWithoutInterestOnlyPeriod - paymentDuringInterestOnlyPeriod,
    monthlyIncreaseAfterInterestOnlyPeriod:
      paymentAfterInterestOnlyPeriod -
      paymentAfterRateChangeWithoutInterestOnlyPeriod,
    additionalCostOfInterestOnlyPeriod:
      planWithInterestOnlyPeriod.totalCost -
      planWithoutInterestOnlyPeriod.totalCost,
    numberOfTermsWithRepayment,
    totalNumberOfTerms,
    effectiveInterestOnlyTerms: numberOfInterestOnlyTerms,
    debtWhenInterestRateChanges: debtWhenRateChanges,
    equalPaymentInterestRatePercent:
      findEqualPaymentInterestRatePercent(loanParameters),
    equivalentInterestRatePercent: findEquivalentInterestRatePercent(
      principal,
      numberOfTerms,
      planWithInterestOnlyPeriod.totalInterestCost,
    ),
  }
}
