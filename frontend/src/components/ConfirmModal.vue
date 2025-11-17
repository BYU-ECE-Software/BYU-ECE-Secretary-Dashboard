<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40" @click="onCancel"></div>

    <!-- Modal -->
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div
        class="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-white border border-byu-navy"
      >
        <!-- Header -->
        <div class="px-6 py-4 bg-byu-navy">
          <h3 class="text-white font-semibold text-lg">
            {{ title }}
          </h3>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-3">
          <!-- Optional icon slot -->
          <slot name="icon"></slot>

          <!-- Body text or slot -->
          <div v-if="message" class="text-sm text-gray-700 whitespace-pre-line">
            {{ message }}
          </div>
          <slot v-else name="body"></slot>
        </div>

        <!-- Actions -->
        <div class="px-3 py-2 flex justify-end gap-2">
          <button
            type="button"
            class="px-3 py-1 rounded-lg border text-sm text-byu-navy hover:bg-gray-100 transition cursor-pointer"
            @click="onCancel"
            :disabled="busy"
          >
            {{ cancelLabel }}
          </button>

          <!-- Confirm button with color variant and busy label -->
          <button
            type="button"
            class="px-3 py-1 rounded-lg text-sm text-white hover:brightness-90 active:brightness-85 shadow-sm transition cursor-pointer"
            :class="variantClass"
            @click="onConfirm"
            :disabled="busy"
            autofocus
          >
            {{ busy ? busyLabel : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

// Public props control visibility, text, behavior, and styling
const props = defineProps({
  open: { type: Boolean, default: false }, // modal visibility
  title: { type: String, default: "Confirm action" }, // header text
  message: { type: String, default: "" }, // simple body text (optional)
  confirmLabel: { type: String, default: "Confirm" }, // confirm button text
  cancelLabel: { type: String, default: "Cancel" }, // cancel button text
  busy: { type: Boolean, default: false }, // disables buttons and swaps label e.g. "Removing…"
  busyLabel: { type: String, default: "Working…" }, // confirm label while busy
  variant: { type: String, default: "danger" }, // visual style of confirm button "danger" | "primary"
  closeOnBackdrop: { type: Boolean, default: true }, // allow backdrop click to close
});

// Emits notify parent of user choice
const emit = defineEmits(["confirm", "cancel"]);

// Choose confirm button color based on variant
const variantClass = computed(() =>
  props.variant === "danger" ? "bg-red-600" : "bg-byu-royal"
);

// Handle cancel
function onCancel() {
  if (!props.closeOnBackdrop && props.busy) return;
  emit("cancel");
}

// Handle confirm
function onConfirm() {
  emit("confirm");
}
</script>
