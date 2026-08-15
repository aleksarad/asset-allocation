<script setup lang="ts">
import { computed } from 'vue'
import { formatCoin, formatUsd } from '@/utils/format'
import type { Currency } from '@/constants/cryptos'

const props = defineProps<{
  currency: Currency
  ratio: number
  usdValue: number
  coinAmount: number | null
}>()

const coinDisplay = computed(() => (props.coinAmount === null ? '-' : formatCoin(props.coinAmount)))
</script>

<template>
  <li class="crypto-item">
    <div class="crypto-item-header">
      <span class="currency">{{ currency }}</span>
      <span class="ratio" :aria-label="`${Math.round(ratio * 100)} allocation percentage`"
        >{{ Math.round(ratio * 100) }}%</span
      >
    </div>

    <span class="currency-amt" :aria-label="`${coinDisplay} ${currency} to purchase`"
      >{{ coinDisplay }} {{ currency }}</span
    >
    <span class="usd-amt" :aria-label="`${formatUsd(usdValue)} in USD`">{{
      formatUsd(usdValue)
    }}</span>
  </li>
</template>

<style scoped>
.crypto-item {
  flex: 1;
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.crypto-item-header {
  display: flex;
  justify-content: space-between;
}

.currency {
  font-size: 0.9rem;
  font-weight: 700;
}

.ratio {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-accent);
  background-color: var(--color-accent-surface);
  padding: 3px 8px;
  border-radius: 6px;
}

.currency-amt {
  font-size: 1.6rem;
  font-weight: 600;
}

.usd-amt {
  font-size: 0.8rem;
  color: var(--color-accent);
}
</style>
