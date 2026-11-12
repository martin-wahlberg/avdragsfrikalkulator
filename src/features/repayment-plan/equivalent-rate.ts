import { calculateMonthlyInterestRate, calculatePayment } from './annuity'

const MAXIMUM_ITERATIONS = 200
const RATE_TOLERANCE_PERCENT = 0.0000000001
const HIGHEST_SEARCHABLE_RATE_PERCENT = 1000

/**
 * Samlet rentekostnad for et vanlig annuitetslan uten avdragsfrihet. Alle
 * terminbelopene er like, sa summen av dem minus hovedstolen er rentene.
 */
function totalInterestWithoutInterestOnlyPeriod(
  principal: number,
  annualInterestRatePercent: number,
  numberOfTerms: number,
): number {
  const payment = calculatePayment(
    calculateMonthlyInterestRate(annualInterestRatePercent),
    numberOfTerms,
    principal,
  )

  return payment * numberOfTerms - principal
}

/**
 * Hvilken rente matte et vanlig annuitetslan hatt for a koste like mye i
 * renter som planen med avdragsfrihet? Rentekostnaden vokser monotont med
 * renten, sa binarsok finner svaret.
 *
 * Dette er ikke effektiv rente. Effektiv rente er internrenten i
 * kontantstrommen, og den er lik i begge planene.
 */
export function findEquivalentInterestRatePercent(
  principal: number,
  numberOfTerms: number,
  targetTotalInterest: number,
): number | null {
  if (principal <= 0 || numberOfTerms <= 0 || targetTotalInterest < 0) {
    return null
  }

  const highestReachableInterest = totalInterestWithoutInterestOnlyPeriod(
    principal,
    HIGHEST_SEARCHABLE_RATE_PERCENT,
    numberOfTerms,
  )

  if (highestReachableInterest < targetTotalInterest) {
    return null
  }

  let lowestRatePercent = 0
  let highestRatePercent = HIGHEST_SEARCHABLE_RATE_PERCENT

  for (
    let iteration = 0;
    iteration < MAXIMUM_ITERATIONS &&
    highestRatePercent - lowestRatePercent > RATE_TOLERANCE_PERCENT;
    iteration += 1
  ) {
    const middleRatePercent = (lowestRatePercent + highestRatePercent) / 2

    if (
      totalInterestWithoutInterestOnlyPeriod(
        principal,
        middleRatePercent,
        numberOfTerms,
      ) > targetTotalInterest
    ) {
      highestRatePercent = middleRatePercent
    } else {
      lowestRatePercent = middleRatePercent
    }
  }

  return (lowestRatePercent + highestRatePercent) / 2
}
