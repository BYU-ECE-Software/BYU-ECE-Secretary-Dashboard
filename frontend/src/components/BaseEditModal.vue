<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <!-- Backdrop (click-to-close) -->
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>

    <!-- Modal container -->
    <div
      class="absolute inset-0 flex items-center justify-center p-4"
      @keydown.esc="$emit('close')"
    >
      <div
        class="w-full rounded-2xl shadow-2xl overflow-hidden bg-white border border-byu-navy"
        :class="sizeClass"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div
          class="px-5 py-4 border-b bg-byu-navy flex items-center justify-between"
        >
          <div class="flex items-start gap-2.5">
            <div>
              <slot name="title">
                <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
              </slot>
            </div>
          </div>

          <button
            class="p-2 rounded-lg hover:bg-[#335A86] transition cursor-pointer"
            @click="$emit('close')"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 8.586 5.293 3.879 3.879 5.293 8.586 10l-4.707 4.707 1.414 1.414L10 11.414l4.707 4.707 1.414-1.414L11.414 10l4.707-4.707-1.414-1.414L10 8.586z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Body (your custom form goes here) -->
        <form class="px-5 py-4 space-y-4" @submit.prevent="$emit('submit')">
          <slot />
          <!-- Divider -->
          <div class="h-px bg-gray-200"></div>

          <!-- Footer -->
          <slot name="footer">
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-3 py-1 rounded-lg border text-byu-navy hover:bg-gray-50 transition cursor-pointer"
                @click="$emit('close')"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving || submitDisabled"
                class="px-3 py-1 rounded-lg bg-byu-royal text-white enabled:hover:bg-[#003C9E] shadow-sm transition enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {{ saving ? "Saving…" : saveLabel }}
              </button>
            </div>
          </slot>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "" },
  saving: { type: Boolean, default: false },
  saveLabel: { type: String, default: "Save" },
  // 'sm' | 'md' | 'lg' to give you easy sizing control
  size: { type: String, default: "md" },
  submitDisabled: { type: Boolean, default: false },
});

const sizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "max-w-md";
    case "lg":
      return "max-w-2xl";
    default:
      return "max-w-lg";
  }
});
</script>
