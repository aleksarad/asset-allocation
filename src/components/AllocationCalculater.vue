<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'

let timer: null | number = null
const BTC_RATIO = 0.7
const ETH_RATIO = 0.3

const usd = ref<string>('')
//debounced user input
const usdDebounced = ref<string>('')
const btcRate = ref<number | null>(null)
const ethRate = ref<number | null>(null)

// usd value sanitized and converted to number
const usdAmount = computed<number>(() => {
  const parsed = Number.parseFloat(usdDebounced.value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
})

watchEffect(async (onCleanup) => {
  if (usdAmount.value <= 0) return
  const abortController = new AbortController()

  onCleanup(() => {
    abortController.abort()
  })

  try {
    const res = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD', {
      signal: abortController.signal,
    })

    if (res.ok) {
      //type json
      const json = await res.json()
      btcRate.value = Number.parseFloat(json.data.rates.BTC)
      ethRate.value = Number.parseFloat(json.data.rates.ETH)
    }
  } catch (err) {
    if (err instanceof Error && err.name !== 'AbortError') {
      throw new Error(err.message)
    }
  } finally {
  }
})

const handleInput = (event: Event) => {
  if (timer) clearTimeout(timer)

  timer = setTimeout(() => {
    const target = event.target as HTMLInputElement
    usdDebounced.value = target.value
  }, 500)
}

const btcUsd = computed(() => usdAmount.value * BTC_RATIO)
const ethUsd = computed(() => usdAmount.value * ETH_RATIO)

// amount of crypto to buy
const btcToBuy = computed(() => (btcRate.value === null ? null : btcRate.value * btcUsd.value))
const ethToBuy = computed(() => (ethRate.value === null ? null : ethRate.value * ethUsd.value))

const coinFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
})
</script>

<template>
  <div>
    <h1>Asset Allocation Calculator</h1>

    <label>
      <span>USD to invest</span>
      <input v-model="usd" @input="handleInput" type="number" min="0" placeholder="0" />
    </label>

    <div class="crypto-container">
      <div class="crypto-item">
        <span>BTC</span><span>70%</span>
        <!-- <span>{{ usdFormatter.format(btcUsd) }}</span> -->
        <span>{{ btcToBuy && coinFormatter.format(btcToBuy) }}</span>
      </div>
      <div class="crypto-item">
        <span>BTC</span><span>70%</span>
        <!-- <span>{{ usdFormatter.format(ethUsd) }}</span> -->
        <span>{{ ethToBuy && coinFormatter.format(ethToBuy) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crypto-item {
  display: flex;
  flex-direction: column;
}
</style>
