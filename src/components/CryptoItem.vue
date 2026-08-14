<script setup lang="ts">
import { computed } from 'vue'
import { formatCoin, formatUsd } from '@/utils/format'

const props = defineProps<{
  currency: string
  ratio: number
  usdValue: number
  coinAmount: number | null
}>()

const coinDisplay = computed(() => (props.coinAmount === null ? '-' : formatCoin(props.coinAmount)))

const percent = Math.round(props.ratio * 100)
const usd = formatUsd(props.usdValue)
</script>

<template>
  <div class="crypto-item">
    <p>{{ currency }}</p>
    <span>{{ percent }}</span>
    <span>{{ usd }}</span>
    <span>{{ coinDisplay }}</span>
  </div>
</template>

<style scoped>
.crypto-item {
  display: flex;
  flex-direction: column;
  border: 1px solid #bbcea8;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}
</style>
