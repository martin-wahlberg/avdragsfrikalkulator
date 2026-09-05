import { calculateMonthlyInterestRate, calculatePayment } from './annuity'
import type { LoanParameters } from './types'

const MAXIMUM_ITERATIONS = 200
const RATE_TOLERANCE_PERCENT = 0.0000000001

/**
 * Hvilken rente etter den avdragsfrie perioden gir samme terminbeløp som
 * lånet uten avdragsfrihet ville hatt til opprinnelig rente? Terminbeløpet
 * vokser monotont med renten, så binærsøk finner svaret.
 */
export function findEqualPaymentInterestRatePercent({
  principal,
  annualInterestRatePercent,
  numberOfTerms,
  numberOfInterestOnlyTerms,
}: LoanParameters): number | null {
  const numberOfTermsWithRepayment = numberOfTerms - numberOfInterestOnlyTerms

  if (numberOfTermsWithRepayment <= 0 || principal <= 0) {
    return null
  }

  const targetPayment = calculatePayment(
    calculateMonthlyInterestRate(annualInterestRatePercent),
    numberOfTerms,
    principal,
  )

  const paymentAtZeroInterest = principal / numberOfTermsWithRepayment

  if (paymentAtZeroInterest > targetPayment) {
    return null
  }

  let lowestRatePercent = 0
  let highestRatePercent = annualInterestRatePercent

  for (
    let iteration = 0;
    iteration < MAXIMUM_ITERATIONS &&
    highestRatePercent - lowestRatePercent > RATE_TOLERANCE_PERCENT;
    iteration += 1
  ) {
    const middleRatePercent = (lowestRatePercent + highestRatePercent) / 2
    const payment = calculatePayment(
      calculateMonthlyInterestRate(middleRatePercent),
      numberOfTermsWithRepayment,
      principal,
    )

    if (payment > targetPayment) {
      highestRatePercent = middleRatePercent
    } else {
      lowestRatePercent = middleRatePercent
    }
  }

  return (lowestRatePercent + highestRatePercent) / 2
}
