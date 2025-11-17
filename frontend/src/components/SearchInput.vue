<template>
  <div class="relative" :class="widthClass">
    <!-- magnifying glass -->
    <MagnifyingGlassIcon
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
      aria-hidden="true"
    />
    <input
      :type="type"
      :placeholder="placeholder"
      class="w-full rounded-lg border border-byu-navy pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy"
      :value="modelValue"
      @input="onInput"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

// so $attrs go to the <input>, not the wrapper div
defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: { type: String, default: "" }, // v-model
  placeholder: { type: String, default: "Search…" },
  widthClass: { type: String, default: "w-full sm:w-80" }, // easy width control
  type: { type: String, default: "search" },
});

const emit = defineEmits(["update:modelValue", "input"]);

function onInput(e) {
  const val = e.target.value;
  emit("update:modelValue", val); // for v-model
  emit("input", val); // fire your onSearchInput handler
}
</script>
<style scoped>
/* Make the clear "×" button on the search bar show a pointer cursor (Chrome/Edge/Safari) */
.search-input::-webkit-search-cancel-button {
  cursor: pointer;
}
</style>
