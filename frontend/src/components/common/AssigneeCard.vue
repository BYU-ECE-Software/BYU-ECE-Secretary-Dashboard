<template>
  <PersonCard :person="person" :eyebrow="eyebrow">
    <template #actions>
      <button
        v-if="showRemove"
        type="button"
        class="px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition"
        @click="$emit('remove')"
      >
        Remove
      </button>
      <button
        v-if="showChange"
        type="button"
        class="px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition"
        @click="$emit('change')"
      >
        Change
      </button>
    </template>
  </PersonCard>
</template>

<script setup>
defineProps({
  person: { type: Object, default: null },
  eyebrow: { type: String, default: "" },
  showRemove: { type: Boolean, default: false },
  showChange: { type: Boolean, default: false },
});
defineEmits(["remove", "change"]);
</script>
