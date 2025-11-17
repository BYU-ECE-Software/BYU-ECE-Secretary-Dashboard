<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-byu-navy">{{
      label
    }}</label>

    <div class="flex items-center gap-2">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('check', safeInt(modelValue))"
        @keydown.enter.prevent="$emit('check', safeInt(modelValue))"
        type="number"
        :placeholder="placeholder"
        min="1"
        class="w-full border border-byu-navy rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
      />
      <button
        v-if="$slots.icon"
        type="button"
        class="px-2 py-1 rounded-lg border border-byu-navy bg-byu-navy/15 text-byu-navy text-sm hover:bg-byu-navy/20 transition cursor-pointer inline-flex items-center justify-center"
        :class="safeInt(modelValue) ? 'visible' : 'invisible'"
        @click="$emit('check', safeInt(modelValue))"
        aria-label="Check"
      >
        <slot name="icon" />
      </button>
    </div>

    <p v-if="hint" class="text-xs text-gray-600">{{ hint }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  hint: { type: String, default: "" },
});
defineEmits(["update:modelValue", "check"]);

const safeInt = (s) => {
  const n = Number.parseInt(String(s ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};
</script>
