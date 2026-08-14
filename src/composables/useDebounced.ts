import { ref, watch, onUnmounted, type Ref } from 'vue'

export function useDebounced<T>(source: Ref<T>, delay = 500): Ref<T> {
  const debouncedVal = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(source, (value) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debouncedVal.value = value
    }, delay)
  })

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return debouncedVal
}
