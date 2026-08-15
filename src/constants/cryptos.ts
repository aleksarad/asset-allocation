export const CRYPTOS = [
  { currency: 'BTC', ratio: 0.7 },
  { currency: 'ETH', ratio: 0.3 },
] as const

export type Currency = (typeof CRYPTOS)[number]['currency'] // 'BTC' | 'ETH'
