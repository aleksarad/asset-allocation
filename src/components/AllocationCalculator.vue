<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatTime } from '@/utils/format'
import CryptoItem from './CryptoItem.vue'
import { useDebounced } from '@/composables/useDebounced'
import { CRYPTOS, type Currency } from '@/constants/cryptos'

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
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`)

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
    <div class="col">
      <div class="header-container">
        <h1>Allocation Calculator</h1>
        <p>70% BTC / 30% ETH</p>
      </div>

      <div class="input-container">
        <label for="usd-input">USD to invest</label>
        <div class="usd-input-wrapper">
          <span class="input-prefix">$</span>
          <input
            class="usd-input"
            v-model="usd"
            id="usd-input"
            type="number"
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <div class="status-container">
        <p v-if="error" role="alert" class="timestamp error">{{ error }}</p>
        <p v-else-if="isLoading && !lastUpdated" class="timestamp">Loading rates...</p>
        <p v-else class="timestamp">Rates last updated at {{ lastUpdated }}</p>
        <button @click="fetchRates" :disabled="isLoading" class="refresh-button" type="button">
          <span aria-hidden="true">⟳</span> {{ isLoading ? 'Refreshing' : 'Refresh rates' }}
        </button>
      </div>

      <ul class="crypto-container">
        <CryptoItem
          v-for="crypto in allocations"
          :key="crypto.currency"
          :currency="crypto.currency"
          :ratio="crypto.ratio"
          :usd-value="crypto.usdValue"
          :coin-amount="crypto.coinAmount"
        />
      </ul>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 24px;
}

.col {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: var(--color-surface);
  padding: 32px;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  max-width: 600px;
}

.header-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 6px;
}

h1 {
  font-size: 1.3rem;
  text-transform: uppercase;
  text-align: left;
  color: var(--color-accent);
}

.header-container p {
  font-size: 0.9rem;
}

.usd-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--color-border);
  padding: 14px;
  border-radius: 10px;
  background: var(--color-bg);
}

.usd-input {
  background: transparent;
  border: none;
  font-size: 1.3rem;
  outline: none;
  color: var(--color-text);
  width: 100%;
}

.usd-input::placeholder {
  color: var(--color-text-muted);
  opacity: 1;
}

.input-prefix {
  font-size: 1.3rem;
  line-height: 1;
}

.input-container {
  border: 1px solid var(--color-border);
  padding: 24px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-container label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-accent);
}

.status-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timestamp {
  color: var(--color-accent);
  font-size: 0.75rem;
}

.error {
  color: var(--color-error);
}

.refresh-button {
  background: transparent;
  color: var(--color-accent);
  padding: 7px 12px;
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  font-size: 0.8rem;
  min-width: 120px;
  cursor: pointer;
}

.refresh-button span {
  font-size: 1rem;
}

.crypto-container {
  list-style: none;
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 480px) {
  main {
    padding: 0;
  }

  .status-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .crypto-container {
    flex-direction: column;
  }
}
</style>
