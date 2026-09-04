export function calculateMonthlyInterestRate(
  annualInterestRatePercent: number,
): number {
  return annualInterestRatePercent / 100 / 12
}

export function calculatePayment(
  monthlyInterestRate: number,
  numberOfTerms: number,
  principal: number,
): number {
  if (numberOfTerms <= 0) {
    return 0
  }

  if (monthlyInterestRate === 0) {
    return principal / numberOfTerms
  }

  return (
    (principal * monthlyInterestRate) /
    (1 - Math.pow(1 + monthlyInterestRate, -numberOfTerms))
  )
}
