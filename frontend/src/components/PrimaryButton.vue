<template>
  <button
    :type="type"
    class="inline-flex items-center gap-2 px-2 py-1 font-semibold rounded-md bg-byu-royal text-white hover:bg-[#003C9E] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <!-- Optional icon slot -->
    <slot name="icon" />
    <!-- Label or default slot -->
    <span v-if="label">{{ label }}</span>
    <slot v-else />
  </button>
</template>

<script setup>
defineProps({
  label: { type: String, default: "" }, // text if you don't want to use default slot
  type: { type: String, default: "button" },
  disabled: { type: Boolean, default: false },
});
defineEmits(["click"]);
</script>
