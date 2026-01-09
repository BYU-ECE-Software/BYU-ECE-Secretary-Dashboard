<template>
  <button
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
    :class="[
      'inline-flex items-center gap-2 px-2 py-1 font-semibold rounded-md cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      attrs.class ?? 'bg-byu-royal text-white hover:bg-[#003C9E]',
    ]"
  >
    <slot name="icon" />
    <span v-if="label">{{ label }}</span>
    <slot v-else />
  </button>
</template>

<script setup>
import { useAttrs } from "vue";

const attrs = useAttrs();

defineProps({
  label: { type: String, default: "" },
  type: { type: String, default: "button" },
  disabled: { type: Boolean, default: false },
});

defineEmits(["click"]);
</script>
