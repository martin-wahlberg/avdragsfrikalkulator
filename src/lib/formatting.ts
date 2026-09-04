const currencyFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
})

const currencyWithDecimalsFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactNumberFormatter = new Intl.NumberFormat('nb-NO', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat('nb-NO', {
  maximumFractionDigits: 0,
})


export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

export function formatCurrencyWithDecimals(amount: number): string {
  return currencyWithDecimalsFormatter.format(amount)
}

export function formatCompactNumber(amount: number): string {
  return compactNumberFormatter.format(amount)
}

export function formatInteger(value: number): string {
  return integerFormatter.format(value)
}

export function formatTermsAsYearsAndMonths(numberOfTerms: number): string {
  const wholeYears = Math.floor(numberOfTerms / 12)
  const remainingMonths = numberOfTerms % 12

  if (wholeYears === 0) {
    return `${remainingMonths} måneder`
  }

  const yearLabel = wholeYears === 1 ? '1 år' : `${wholeYears} år`

  if (remainingMonths === 0) {
    return yearLabel
  }

  return `${yearLabel} og ${remainingMonths} måneder`
}
