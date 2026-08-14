const coinFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
})

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

export function formatUsd(value: number) {
  return usdFormatter.format(value)
}

export function formatCoin(value: number) {
  return coinFormatter.format(value)
}

export function formatTime(value: Date) {
  return timeFormatter.format(value)
}
