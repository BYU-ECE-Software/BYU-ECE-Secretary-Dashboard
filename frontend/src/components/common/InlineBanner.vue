<template>
  <div :class="classes" role="status">
    <slot />
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  tone: { type: String, default: "info" }, // 'info' | 'warn' | 'success' | 'error'
});
const classes = computed(() => {
  const base = "text-sm rounded-lg px-3 py-2";
  switch (props.tone) {
    case "warn":
      return `${base} bg-amber-50 text-amber-900 border border-amber-200`;
    case "success":
      return `${base} bg-green-50 text-green-900 border border-green-200`;
    case "error":
      return `${base} bg-red-50 text-red-900 border border-red-200`;
    default:
      return `${base} bg-byu-navy/5 text-byu-navy border border-byu-navy/10`;
  }
});
</script>
