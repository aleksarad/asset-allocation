<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatTime } from '@/utils/format.ts'
import CryptoItem from './CryptoItem.vue'
import { useDebounced } from '@/composables/useDebounced.ts'

const CRYPTOS = [
  { currency: 'BTC', ratio: 0.7 },
  { currency: 'ETH', ratio: 0.3 },
] as const

type Currency = (typeof CRYPTOS)[number]['currency'] // 'BTC' | 'ETH'

interface ExchangeRates {
  data: {
    currency: string
    rates: Record<Currency, string>
  }
}

const usd = ref<string>('')
const usdDebounced = useDebounced(usd, 500)
const rates = ref<Record<Currency, number> | null>(null)
const lastFetched = ref<Date | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// usd value sanitized and converted to number
const usdAmount = computed<number>(() => {
  const parsed = Number.parseFloat(usdDebounced.value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
})

const fetchRates = async () => {
  isLoading.value = true
  error.value = null
  try {
    const res = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD')
    if (!res.ok) throw new Error(`Resquest failed with status ${res.status}`)

    const json: ExchangeRates = await res.json()
    rates.value = Object.fromEntries(
      CRYPTOS.map(({ currency }) => [currency, Number.parseFloat(json.data.rates[currency])]),
    ) as Record<Currency, number>

    lastFetched.value = new Date()
  } catch (err) {
    error.value = 'Something went wrong. Please try again'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchRates)

const lastUpdated = computed(() =>
  lastFetched.value === null ? null : formatTime(lastFetched.value),
)

const allocations = computed(() => {
  return CRYPTOS.map(({ currency, ratio }) => {
    const usdValue = usdAmount.value * ratio
    const rate = rates.value?.[currency] ?? null
    return {
      currency,
      ratio,
      usdValue,
      coinAmount: rate === null ? null : usdValue * rate,
    }
  })
})
</script>

<template>
  <main>
    <h1>Asset Allocation Split</h1>
    <h2>70% BTC/30% ETH</h2>

    <div class="input-container">
      <label for="usd-input">USD to invest</label>
      <div class="usd-input-wrapper">
        <span class="input-prefix">$</span>
        <input
          class="usd-input"
          v-model="usd"
          id="usd-input"
          type="number"
          inputmode="decimal"
          min="0"
          placeholder="0"
        />
      </div>
    </div>

    <div class="status-container">
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <p v-else class="timestamp">Last updated {{ lastUpdated }}</p>

      <button @click="fetchRates" :disabled="isLoading">
        {{ isLoading ? 'Refreshing' : 'Refresh rates' }}
      </button>
    </div>

    <div class="crypto-container">
      <CryptoItem
        v-for="crypto in allocations"
        :key="crypto.currency"
        :currency="crypto.currency"
        :ratio="crypto.ratio"
        :usd-value="crypto.usdValue"
        :coin-amount="crypto.coinAmount"
      />
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.usd-input-wrapper {
  display: flex;
  /* max-width: 10rem; */
  align-items: center;
  gap: 10px;
  border: 1px solid grey;
  padding: 1rem;
  border-radius: 10px;
}

.usd-input {
  background: transparent;
  background: none;
  border: none;
  font-size: 20px;
  outline: none;
  color: white;
  width: 100%;
}

.input-prefix {
  font-size: 20px;
}

.input-container {
  border: 1px solid grey;
  padding: 24px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.crypto-container {
  margin-top: 2rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
}
</style>
